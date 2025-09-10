import express from 'express';
import cors from 'cors';
import pg from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const { Pool } = pg;

const app = express();
const port = 3001;

// --- IMPORTANT ---
// Replace these with your actual PostgreSQL connection details.
const pool = new Pool({
  user: 'erp_admin',
  host: 'localhost',
  database: 'erp_db',
  password: 'ERP123!',
  port: 5432,
});

// A secret key for signing JWTs. Store this in an environment variable.
const JWT_SECRET = 'your-super-secret-key-that-is-long-and-secure';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// --- Helper Functions ---
const snakeToCamel = (str) => {
    if (str === null || str === undefined) return str;
    return str.replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace('-', '').replace('_', ''));
};

const formatRowKeys = (row) => {
    if (!row) return row;
    const newRow = {};
    for (const key in row) {
        newRow[snakeToCamel(key)] = row[key];
    }
    return newRow;
};

const compareProposalVersions = (v1Items, v2Items) => {
    const changes = [];
    const v1Map = new Map(v1Items.map(i => [i.id, i]));
    const v2Map = new Map(v2Items.map(i => [i.id, i]));

    for (const [productId, item1] of v1Map.entries()) {
        const item2 = v2Map.get(productId);
        if (!item2) {
            changes.push({ type: 'removed', productId, productName: item1.name, previousValue: item1.orderQty });
        } else if (item1.orderQty !== item2.orderQty) {
            changes.push({ type: 'quantity_change', productId, productName: item1.name, previousValue: item1.orderQty, newValue: item2.orderQty });
        }
    }

    for (const [productId, item2] of v2Map.entries()) {
        if (!v1Map.has(productId)) {
            changes.push({ type: 'added', productId, productName: item2.name, newValue: item2.orderQty });
        }
    }
    return changes;
};

// --- Authentication Middleware (Placeholder) ---
// In a real app, this would verify the JWT from the Authorization header
const authenticateToken = (req, res, next) => {
    // const authHeader = req.headers['authorization'];
    // const token = authHeader && authHeader.split(' ')[1];
    // if (token == null) return res.sendStatus(401);

    // jwt.verify(token, JWT_SECRET, (err, user) => {
    //     if (err) return res.sendStatus(403);
    //     req.user = user;
    //     next();
    // });
    next(); // Bypassing auth for now
};

// --- API Endpoints ---

// --- AUTH ---
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }
        const user = formatRowKeys(result.rows[0]);
        
        // In a real app, you would compare a hashed password:
        // const validPassword = await bcrypt.compare(password, user.passwordHash);
        // For this demo, we compare plain text from the seed.
        const validPassword = password === user.password;
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        const userBusinessUnitsResult = await pool.query('SELECT business_unit FROM user_business_units WHERE user_id = $1', [user.id]);
        user.businessUnits = userBusinessUnitsResult.rows.map(r => r.business_unit);
        
        // Remove password before sending user object back
        delete user.password;
        
        // Create and sign a JWT
        const accessToken = jwt.sign({ id: user.id, username: user.username, roleId: user.roleId }, JWT_SECRET, { expiresIn: '1d' });

        res.json({ accessToken, user });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/auth/check-email', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email is required.' });
    }
    try {
        const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        res.json({ exists: result.rows.length > 0 });
    } catch (err) {
        console.error('Check email error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/auth/reset-password', authenticateToken, async (req, res) => {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
        return res.status(400).json({ error: 'Email and new password are required.' });
    }
    if (newPassword.length < 4) {
        return res.status(400).json({ error: 'Password must be at least 4 characters long.' });
    }
    try {
        const result = await pool.query(
            'UPDATE users SET password = $1 WHERE email = $2 RETURNING id, username, email, profile_picture, role_id',
            [newPassword, email]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User with that email not found.' });
        }
        res.status(200).json(formatRowKeys(result.rows[0]));
    } catch (err) {
        console.error('Password reset error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// --- DATA FETCHING ---

// GET all data needed for the PUBLIC MENU VIEW
app.get('/api/public-menu-data', async (req, res) => {
    const { brand } = req.query; // 'sunshine-pf' or 'fairwinds'
    
    if (!brand) {
        return res.status(400).json({ error: 'Brand query parameter is required.' });
    }
    
    const businessUnits = brand === 'sunshine-pf' ? ['sunshine', 'passion-flower'] : ['fairwinds', 'passion-flower'];
    
    try {
        const client = await pool.connect();
        const productsQuery = client.query({
            text: `
                SELECT 
                    p.id, p.name, p.description, p.sku, p.top_terpenes, p.genetics, 
                    p.feels_like, p.doh_type, p.qty_in_stock, p.business_unit, 
                    pt.name AS product_type,
                    pt.price, 
                    pt.image,
                    c.name AS category,
                    p.alert_banner_id
                FROM products p
                LEFT JOIN product_types pt ON p.product_type_id = pt.id
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.business_unit = ANY($1::text[])
            `,
            values: [businessUnits],
        });
        const productTypesQuery = client.query({
            text: `
                SELECT 
                    pt.id, pt.name, pt.price, pt.image, pt.business_unit,
                    c.name AS category
                FROM product_types pt
                LEFT JOIN categories c ON pt.category_id = c.id
                WHERE pt.business_unit = ANY($1::text[])
            `,
            values: [businessUnits]
        });
        const dispensariesQuery = client.query('SELECT * FROM dispensaries');
        const alertBannersQuery = client.query('SELECT * FROM alert_banners WHERE business_unit = ANY($1::text[])', [businessUnits]);
        const categoriesQuery = client.query('SELECT * FROM categories WHERE business_unit = ANY($1::text[])', [businessUnits]);
        const ordersQuery = client.query('SELECT * FROM orders');
        const vmiOrdersQuery = client.query('SELECT * FROM vmi_orders');
        
        const [productsRes, productTypesRes, dispensariesRes, alertBannersRes, categoriesRes, ordersRes, vmiOrdersRes] = await Promise.all([
            productsQuery, productTypesQuery, dispensariesQuery, alertBannersQuery, categoriesQuery, ordersQuery, vmiOrdersQuery
        ]);

        client.release();

        const productsResult = productsRes.rows.map(p => {
            const formatted = formatRowKeys(p);
            formatted.alertBanner = formatted.alertBannerId;
            delete formatted.alertBannerId;
            return formatted;
        });

        res.json({
            products: productsResult,
            productTypes: productTypesRes.rows.map(formatRowKeys),
            dispensaries: dispensariesRes.rows.map(formatRowKeys),
            alertBanners: alertBannersRes.rows.map(formatRowKeys),
            categories: categoriesRes.rows.map(formatRowKeys),
            orders: ordersRes.rows.map(formatRowKeys),
            vmiOrders: vmiOrdersRes.rows.map(formatRowKeys),
        });
    } catch (err) {
        console.error('Failed to fetch public menu data:', err);
        res.status(500).json({ error: 'Failed to fetch public menu data' });
    }
});


// GET all data needed for the ADMIN VIEW
app.get('/api/admin-data', async (req, res) => {
    try {
        const client = await pool.connect();

        const queries = [
            pool.query(`
                SELECT 
                    p.id, p.name, p.description, p.sku, p.top_terpenes, p.genetics, 
                    p.feels_like, p.doh_type, p.qty_in_stock, p.business_unit, 
                    pt.name AS product_type,
                    c.name AS category,
                    p.alert_banner_id
                FROM products p
                LEFT JOIN product_types pt ON p.product_type_id = pt.id
                LEFT JOIN categories c ON p.category_id = c.id
            `),
            pool.query(`
                SELECT d.*, u.username as sales_rep_name, u.email as sales_rep_email
                FROM dispensaries d
                LEFT JOIN users u ON d.sales_rep_id = u.id
            `),
            pool.query('SELECT u.id, u.username, u.email, u.role_id, u.profile_picture, u.password FROM users u'),
            pool.query(`
                SELECT 
                    pt.id, pt.name, pt.price, pt.image, pt.business_unit,
                    c.name AS category
                FROM product_types pt
                LEFT JOIN categories c ON pt.category_id = c.id
            `),
            pool.query('SELECT * FROM alert_banners'),
            pool.query('SELECT * FROM categories'),
            pool.query('SELECT * FROM roles'),
            pool.query('SELECT * FROM orders'),
            pool.query('SELECT * FROM vmi_orders'),
            pool.query('SELECT * FROM notifications'),
            // Settings Queries
            pool.query('SELECT * FROM application_settings'),
            pool.query('SELECT * FROM category_sort ORDER BY business_unit, sort_order'),
            pool.query('SELECT * FROM mobile_nav_config ORDER BY display_order'),
        ];
        
        const [
            productsRes, dispensariesRes, usersRes, productTypesRes, 
            alertBannersRes, categoriesRes, rolesRes, ordersRes, vmiOrdersRes, notificationsRes,
            settingsRes, categorySortRes, mobileNavRes
        ] = await Promise.all(queries);

        const allDispensaries = dispensariesRes.rows.map(formatRowKeys);
        const allUsers = usersRes.rows.map(formatRowKeys);
        
        const usersWithBUs = await Promise.all(allUsers.map(async (user) => {
             const buRes = await client.query('SELECT business_unit FROM user_business_units WHERE user_id = $1', [user.id]);
             return { ...user, businessUnits: buRes.rows.map(r => r.business_unit) };
        }));

        const productsResult = productsRes.rows.map(p => {
            const formatted = formatRowKeys(p);
            formatted.alertBanner = formatted.alertBannerId;
            delete formatted.alertBannerId;
            return formatted;
        });

        const processedOrders = await Promise.all(ordersRes.rows.map(async (order) => {
            const formattedOrder = formatRowKeys(order);
            const dispensary = allDispensaries.find(d => d.id === formattedOrder.dispensaryId);
            const salesRepUser = allUsers.find(u => u.id === formattedOrder.salesRepId);
            const itemsRes = await client.query('SELECT * FROM order_items WHERE order_id = $1', [formattedOrder.id]);
            const items = itemsRes.rows.map(itemRow => {
                const snapshot = itemRow.product_snapshot;
                const formattedItem = formatRowKeys(itemRow);
                const price = parseFloat(formattedItem.priceAtTimeOfOrder);
                const quantity = parseInt(formattedItem.quantity, 10);
                const originalProduct = productsResult.find(p => p.id === formattedItem.productId);
                return {
                    id: formattedItem.productId, name: snapshot.name, productType: snapshot.productType, price: price,
                    orderQty: quantity, lineTotal: price * quantity, sku: snapshot.sku,
                    category: originalProduct?.category || 'N/A',
                    businessUnit: originalProduct?.businessUnit || (formattedOrder.businessUnit === 'sunshine-pf' ? 'sunshine' : 'fairwinds'),
                };
            });
            return {
                ...formattedOrder,
                dispensary: dispensary || { id: formattedOrder.dispensaryId, name: 'Unknown Dispensary' },
                salesRep: salesRepUser ? { name: salesRepUser.username, email: salesRepUser.email } : { name: 'Unknown Rep', email: '' },
                items: items
            };
        }));
        
        const processedVmiOrders = await Promise.all(vmiOrdersRes.rows.map(async (order) => {
            const formattedOrder = formatRowKeys(order);
            const dispensary = allDispensaries.find(d => d.id === formattedOrder.dispensaryId);
            const salesRepUser = allUsers.find(u => u.id === formattedOrder.salesRepId);
            const versionsRes = await client.query('SELECT * FROM vmi_proposal_versions WHERE vmi_order_id = $1 ORDER BY version_number ASC', [formattedOrder.id]);
            const versions = await Promise.all(versionsRes.rows.map(async (v) => {
                const formattedVersion = formatRowKeys(v);
                const itemsRes = await client.query('SELECT * FROM vmi_version_items WHERE version_id = $1', [formattedVersion.id]);
                const items = itemsRes.rows.map(itemRow => {
                    const snapshot = itemRow.product_snapshot;
                    const formattedItem = formatRowKeys(itemRow);
                    const price = parseFloat(formattedItem.priceAtTimeOfProposal);
                    const quantity = parseInt(formattedItem.quantity, 10);
                    const originalProduct = productsResult.find(p => p.id === formattedItem.productId);
                    return {
                        id: formattedItem.productId, name: snapshot.name, productType: snapshot.productType, price: price,
                        orderQty: quantity, lineTotal: price * quantity, sku: snapshot.sku,
                        category: originalProduct?.category || 'N/A',
                        businessUnit: originalProduct?.businessUnit || (formattedOrder.businessUnit === 'sunshine-pf' ? 'sunshine' : 'fairwinds'),
                    };
                });
                return { ...formattedVersion, items };
            }));
            return {
                ...formattedOrder,
                dispensary: dispensary || { id: formattedOrder.dispensaryId, name: 'Unknown Dispensary' },
                salesRep: salesRepUser ? { name: salesRepUser.username, email: salesRepUser.email } : { name: 'Unknown Rep', email: '' },
                versions: versions
            };
        }));
        
        client.release();

        res.json({
            products: productsResult,
            dispensaries: allDispensaries,
            users: usersWithBUs,
            productTypes: productTypesRes.rows.map(formatRowKeys),
            alertBanners: alertBannersRes.rows.map(formatRowKeys),
            categories: categoriesRes.rows.map(formatRowKeys),
            roles: rolesRes.rows.map(formatRowKeys),
            orders: processedOrders,
            vmiOrders: processedVmiOrders,
            notifications: notificationsRes.rows.map(formatRowKeys),
            settings: {
                inventoryThresholds: settingsRes.rows.reduce((acc, row) => {
                    acc[row.key] = row.value;
                    return acc;
                }, {}),
                categorySort: categorySortRes.rows.map(formatRowKeys),
                mobileNavConfig: mobileNavRes.rows.map(row => {
                    const formatted = formatRowKeys(row);
                    // Map display_order from DB to order for frontend type consistency
                    formatted.order = formatted.displayOrder;
                    delete formatted.displayOrder;
                    return formatted;
                }),
            }
        });

    } catch (err) {
        console.error('Failed to fetch admin data:', err);
        res.status(500).json({ error: 'Failed to fetch admin data' });
    }
});


// --- ORDERS ---
app.post('/api/orders', authenticateToken, async (req, res) => {
  const ordersData = req.body; // Expecting an array of orders

  if (!Array.isArray(ordersData) || ordersData.length === 0) {
      return res.status(400).json({ error: 'Request body must be an array of orders.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const createdOrderIds = [];

    for (const order of ordersData) {
        const { id, date, dispensary, salesRepId, items, businessUnit } = order;

        if (!id || !date || !dispensary || !salesRepId || !items || !items.length) {
            throw new Error('Missing required order data for one of the orders.');
        }

        const orderQuery = `
            INSERT INTO orders (id, order_date, dispensary_id, sales_rep_id, business_unit) 
            VALUES ($1, $2, $3, $4, $5)
        `;
        await client.query(orderQuery, [id, date, dispensary.id, salesRepId, businessUnit]);

        for (const item of items) {
            const itemQuery = `
                INSERT INTO order_items (order_id, product_id, quantity, price_at_time_of_order, product_snapshot) 
                VALUES ($1, $2, $3, $4, $5)
            `;
            const productSnapshot = { name: item.name, sku: item.sku, productType: item.productType };
            await client.query(itemQuery, [id, item.id, item.orderQty, item.price, JSON.stringify(productSnapshot)]);
        }
        createdOrderIds.push(id);
    }

    await client.query('COMMIT');
    res.status(201).json({ createdOrderIds });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Failed to create order:', err);
    res.status(500).json({ error: 'Failed to create order(s).' });
  } finally {
    client.release();
  }
});

// --- INVENTORY ---
app.post('/api/inventory/sync', authenticateToken, async (req, res) => {
    const { scrapedItems } = req.body;
    if (!Array.isArray(scrapedItems)) {
        return res.status(400).json({ error: 'Request body must contain an array of scrapedItems.' });
    }

    const client = await pool.connect();
    let updatedCount = 0;
    const notFoundSkus = [];

    try {
        await client.query('BEGIN');

        for (const item of scrapedItems) {
            const newStock = Math.max(0, (item.unitsForSale || 0) - (item.allocations || 0));
            const result = await client.query(
                'UPDATE products SET qty_in_stock = $1 WHERE sku = $2',
                [newStock, item.sku]
            );
            if (result.rowCount > 0) {
                updatedCount++;
            } else {
                notFoundSkus.push(item.sku);
            }
        }
        
        await client.query('COMMIT');
        res.status(200).json({ updatedCount, notFoundSkus });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Failed to sync inventory:', err);
        res.status(500).json({ error: 'Failed to sync inventory.' });
    } finally {
        client.release();
    }
});


// --- VMI PROPOSALS ---
app.post('/api/vmi-proposals', authenticateToken, async (req, res) => {
    const { dispensary, items, businessUnit, salesRepId } = req.body;
    if (!dispensary || !items || !businessUnit || !salesRepId) {
        return res.status(400).json({ error: 'Missing required fields for VMI proposal.' });
    }
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const vmiOrderId = `vmi-prop-${Date.now()}`;
        
        await client.query('UPDATE vmi_orders SET is_active = false WHERE dispensary_id = $1', [dispensary.id]);

        await client.query(
            `INSERT INTO vmi_orders (id, dispensary_id, sales_rep_id, status, is_active, business_unit) 
             VALUES ($1, $2, $3, 'submitted_to_customer', true, $4)`,
            [vmiOrderId, dispensary.id, salesRepId, businessUnit]
        );

        const versionResult = await client.query(
            `INSERT INTO vmi_proposal_versions (vmi_order_id, version_number, created_by) 
             VALUES ($1, 1, 'sales_rep') RETURNING id`,
            [vmiOrderId]
        );
        const versionId = versionResult.rows[0].id;

        for (const item of items) {
            await client.query(
                `INSERT INTO vmi_version_items (version_id, product_id, quantity, price_at_time_of_proposal, product_snapshot) 
                 VALUES ($1, $2, $3, $4, $5)`,
                [versionId, item.id, item.orderQty, item.price, JSON.stringify({ name: item.name, sku: item.sku, productType: item.productType })]
            );
        }

        await client.query('COMMIT');

        const newProposal = {
            id: vmiOrderId,
            dispensary,
            salesRep: { name: dispensary.salesRepName, email: dispensary.salesRepEmail },
            salesRepId,
            status: 'submitted_to_customer',
            link: `http://example.com/vmi/${vmiOrderId}/v1`, // Placeholder
            isActive: true,
            versions: [{
                versionNumber: 1,
                createdBy: 'sales_rep',
                createdAt: new Date().toISOString(),
                items: items,
                changes: []
            }],
            businessUnit
        };

        res.status(201).json(newProposal);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Failed to create VMI proposal:', err);
        res.status(500).json({ error: 'Failed to create VMI proposal.' });
    } finally {
        client.release();
    }
});

app.put('/api/vmi-proposals/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { items: newItems, updatedBy } = req.body;

    if (!newItems || !updatedBy) {
        return res.status(400).json({ error: 'Missing items or updatedBy field.' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Get latest version
        const latestVersionRes = await client.query(
            `SELECT id, version_number FROM vmi_proposal_versions 
             WHERE vmi_order_id = $1 ORDER BY version_number DESC LIMIT 1`,
            [id]
        );
        if (latestVersionRes.rows.length === 0) {
            return res.status(404).json({ error: 'Proposal not found.' });
        }
        const { id: latestVersionId, version_number: latestVersionNumber } = latestVersionRes.rows[0];

        // Get items from latest version to compare
        const latestItemsRes = await client.query('SELECT * FROM vmi_version_items WHERE version_id = $1', [latestVersionId]);
        const latestItems = latestItemsRes.rows.map(itemRow => {
            const snapshot = itemRow.product_snapshot;
            return { id: itemRow.product_id, name: snapshot.name, orderQty: itemRow.quantity };
        });

        // Compare versions and create changes log
        const changes = compareProposalVersions(latestItems, newItems);

        // Insert new version
        const newVersionNumber = latestVersionNumber + 1;
        const newVersionRes = await client.query(
            `INSERT INTO vmi_proposal_versions (vmi_order_id, version_number, created_by, changes) 
             VALUES ($1, $2, $3, $4) RETURNING id, created_at`,
            [id, newVersionNumber, updatedBy, JSON.stringify(changes)]
        );
        const newVersionId = newVersionRes.rows[0].id;
        const newVersionCreatedAt = newVersionRes.rows[0].created_at;

        // Insert new items for the new version
        for (const item of newItems) {
            await client.query(
                `INSERT INTO vmi_version_items (version_id, product_id, quantity, price_at_time_of_proposal, product_snapshot) 
                 VALUES ($1, $2, $3, $4, $5)`,
                [newVersionId, item.id, item.orderQty, item.price, JSON.stringify({ name: item.name, sku: item.sku, productType: item.productType })]
            );
        }

        // Update the main proposal status
        await client.query("UPDATE vmi_orders SET status = 'pending_review' WHERE id = $1", [id]);

        await client.query('COMMIT');
        
        // Fetch full order to return
        const orderRes = await client.query('SELECT * FROM vmi_orders WHERE id = $1', [id]);
        const order = formatRowKeys(orderRes.rows[0]);
        // For simplicity, we construct the new version object. A full fetch would be more robust.
        const newVersionForClient = {
            id: newVersionId,
            versionNumber: newVersionNumber,
            createdBy: updatedBy,
            createdAt: newVersionCreatedAt,
            changes: changes,
            items: newItems
        };

        res.status(200).json({ status: 'ok', newVersion: newVersionForClient, orderId: id });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Failed to update VMI proposal:', err);
        res.status(500).json({ error: 'Failed to update VMI proposal.' });
    } finally {
        client.release();
    }
});

app.delete('/api/vmi-proposals/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM vmi_orders WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'VMI Proposal not found.' });
        }
        res.status(204).send();
    } catch (err) {
        console.error('Failed to delete VMI proposal:', err);
        res.status(500).json({ error: 'Failed to delete VMI proposal' });
    }
});

// --- NOTIFICATIONS ---
app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'UPDATE notifications SET is_read = true WHERE id = $1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Notification not found.' });
        }
        res.status(200).json(formatRowKeys(result.rows[0]));
    } catch (err) {
        console.error('Failed to mark notification as read:', err);
        res.status(500).json({ error: 'Failed to update notification.' });
    }
});

app.put('/api/notifications/read-bulk', authenticateToken, async (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'An array of notification IDs is required.' });
    }
    try {
        const result = await pool.query(
            'UPDATE notifications SET is_read = true WHERE id = ANY($1::text[]) RETURNING *',
            [ids]
        );
        res.status(200).json(result.rows.map(formatRowKeys));
    } catch (err) {
        console.error('Failed to bulk mark notifications as read:', err);
        res.status(500).json({ error: 'Failed to update notifications.' });
    }
});

// --- BULK UPLOADS ---
app.post('/api/products/bulk-upload', authenticateToken, async (req, res) => {
    const { products } = req.body;
    if (!Array.isArray(products)) {
        return res.status(400).json({ error: 'Request body must contain an array of products.' });
    }

    const client = await pool.connect();
    const errors = [];
    let successCount = 0;

    try {
        await client.query('BEGIN');

        for (const p of products) {
            try {
                const ptRes = await client.query('SELECT id FROM product_types WHERE name = $1 AND business_unit = $2', [p.productType, p.businessUnit]);
                const catRes = await client.query('SELECT id FROM categories WHERE name = $1 AND business_unit = $2', [p.category, p.businessUnit]);
                
                const productTypeId = ptRes.rows[0]?.id;
                const categoryId = catRes.rows[0]?.id;

                if (!productTypeId || !categoryId) {
                    throw new Error(`Invalid Product Type or Category for SKU ${p.sku}`);
                }

                const query = `
                    INSERT INTO products (id, sku, name, description, top_terpenes, genetics, feels_like, doh_type, qty_in_stock, business_unit, product_type_id, category_id, alert_banner_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                    ON CONFLICT (sku) DO UPDATE SET
                        name = EXCLUDED.name,
                        description = EXCLUDED.description,
                        top_terpenes = EXCLUDED.top_terpenes,
                        genetics = EXCLUDED.genetics,
                        feels_like = EXCLUDED.feels_like,
                        doh_type = EXCLUDED.doh_type,
                        business_unit = EXCLUDED.business_unit,
                        product_type_id = EXCLUDED.product_type_id,
                        category_id = EXCLUDED.category_id,
                        alert_banner_id = EXCLUDED.alert_banner_id;
                `;
                
                const newId = `prod-csv-${p.sku}`;
                await client.query(query, [newId, p.sku, p.name, p.description, p.topTerpenes, p.genetics, p.feelsLike, p.dohType, p.qtyInStock || 0, p.businessUnit, productTypeId, categoryId, p.alertBanner || null]);
                successCount++;
            } catch (itemError) {
                errors.push(`Failed to process SKU ${p.sku}: ${itemError.message}`);
            }
        }

        if (errors.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Bulk upload failed due to data errors.', details: errors });
        }

        await client.query('COMMIT');
        
        // Fetch all products again to return the updated list
        const updatedProductsRes = await client.query(`
            SELECT p.*, pt.name as product_type, c.name as category, p.alert_banner_id
            FROM products p
            LEFT JOIN product_types pt ON p.product_type_id = pt.id
            LEFT JOIN categories c ON p.category_id = c.id
        `);
        
        const updatedProducts = updatedProductsRes.rows.map(p => {
            const formatted = formatRowKeys(p);
            formatted.alertBanner = formatted.alertBannerId;
            delete formatted.alertBannerId;
            return formatted;
        });

        res.status(200).json({ message: `${successCount} products processed.`, updatedProducts });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Bulk product upload error:', err);
        res.status(500).json({ error: 'Internal server error during bulk upload.' });
    } finally {
        client.release();
    }
});

app.post('/api/dispensaries/bulk-upload', authenticateToken, async (req, res) => {
    const { dispensaries } = req.body;
    if (!Array.isArray(dispensaries)) {
        return res.status(400).json({ error: 'Request body must contain an array of dispensaries.' });
    }

    const client = await pool.connect();
    const errors = [];
    let successCount = 0;
    
    try {
        await client.query('BEGIN');
        
        for (const d of dispensaries) {
            try {
                const userRes = await client.query('SELECT id FROM users WHERE email = $1', [d.salesRepEmail]);
                const salesRepId = userRes.rows[0]?.id;

                if (!salesRepId) {
                    throw new Error(`Sales rep with email ${d.salesRepEmail} not found.`);
                }
                
                const query = `
                    INSERT INTO dispensaries (id, license_number, name, address, phone, email, sales_rep_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    ON CONFLICT (license_number) DO UPDATE SET
                        name = EXCLUDED.name,
                        address = EXCLUDED.address,
                        phone = EXCLUDED.phone,
                        email = EXCLUDED.email,
                        sales_rep_id = EXCLUDED.sales_rep_id;
                `;
                const newId = `disp-csv-${d.licenseNumber}`;
                await client.query(query, [newId, d.licenseNumber, d.name, d.address, d.phone, d.email, salesRepId]);
                successCount++;
            } catch (itemError) {
                errors.push(`Failed to process license ${d.licenseNumber}: ${itemError.message}`);
            }
        }
        
        if (errors.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Bulk upload failed due to data errors.', details: errors });
        }

        await client.query('COMMIT');

        // Fetch all dispensaries to return updated list
        const updatedDispensariesRes = await client.query(`
            SELECT d.*, u.username as sales_rep_name, u.email as sales_rep_email
            FROM dispensaries d
            LEFT JOIN users u ON d.sales_rep_id = u.id
        `);

        res.status(200).json({ message: `${successCount} dispensaries processed.`, updatedDispensaries: updatedDispensariesRes.rows.map(formatRowKeys) });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Bulk dispensary upload error:', err);
        res.status(500).json({ error: 'Internal server error during bulk upload.' });
    } finally {
        client.release();
    }
});


// --- CATEGORIES ---
app.post('/api/categories', authenticateToken, async (req, res) => {
    const { id, name, businessUnit } = req.body;
    if (!id || !name || !businessUnit) {
        return res.status(400).json({ error: 'Missing required fields for category.' });
    }
    try {
        const result = await pool.query(
            'INSERT INTO categories (id, name, business_unit) VALUES ($1, $2, $3) RETURNING *',
            [id, name, businessUnit]
        );
        res.status(201).json(formatRowKeys(result.rows[0]));
    } catch (err) {
        console.error('Failed to create category:', err);
        res.status(500).json({ error: 'Failed to create category' });
    }
});

app.put('/api/categories/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Category name is required for update.' });
    }
    try {
        const result = await pool.query(
            'UPDATE categories SET name = $1 WHERE id = $2 RETURNING *',
            [name, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Category not found.' });
        }
        res.status(200).json(formatRowKeys(result.rows[0]));
    } catch (err) {
        console.error('Failed to update category:', err);
        res.status(500).json({ error: 'Failed to update category' });
    }
});

app.delete('/api/categories/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM categories WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Category not found.' });
        }
        res.status(204).send(); // No Content
    } catch (err) {
        console.error('Failed to delete category:', err);
        res.status(500).json({ error: 'Failed to delete category' });
    }
});


// --- PRODUCT TYPES ---
app.post('/api/product-types', authenticateToken, async (req, res) => {
    const { name, price, image, category, businessUnit } = req.body;
    if (!name || price === undefined || !category || !businessUnit) {
        return res.status(400).json({ error: 'Missing required fields for product type.' });
    }

    const client = await pool.connect();
    try {
        const categoryRes = await client.query(
            'SELECT id FROM categories WHERE name = $1 AND business_unit = $2',
            [category, businessUnit]
        );

        if (categoryRes.rows.length === 0) {
            return res.status(400).json({ error: `Category '${category}' not found for business unit '${businessUnit}'.` });
        }
        const categoryId = categoryRes.rows[0].id;

        const result = await client.query(
            'INSERT INTO product_types (name, price, image, category_id, business_unit) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [name, parseFloat(price), image, categoryId, businessUnit]
        );
        
        const newProductType = {
            id: result.rows[0].id,
            name,
            price: parseFloat(price),
            image,
            category,
            businessUnit,
        };

        res.status(201).json(newProductType);
    } catch (err) {
        console.error('Failed to create product type:', err);
        if (err.code === '23505') {
             return res.status(409).json({ error: `A product type with the name "${name}" may already exist.` });
        }
        res.status(500).json({ error: 'Failed to create product type' });
    } finally {
        client.release();
    }
});

app.put('/api/product-types/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, price, image, category } = req.body;
     if (!name || price === undefined || !category) {
        return res.status(400).json({ error: 'Missing required fields for update.' });
    }

    const client = await pool.connect();
    try {
        const ptRes = await client.query('SELECT business_unit FROM product_types WHERE id = $1', [id]);
        if (ptRes.rows.length === 0) {
             return res.status(404).json({ error: 'Product type not found.' });
        }
        const currentBusinessUnit = ptRes.rows[0].business_unit;

        const categoryRes = await client.query(
            'SELECT id FROM categories WHERE name = $1 AND business_unit = $2',
            [category, currentBusinessUnit]
        );

        if (categoryRes.rows.length === 0) {
            return res.status(400).json({ error: `Category '${category}' not found for business unit '${currentBusinessUnit}'.` });
        }
        const categoryId = categoryRes.rows[0].id;
        
        const result = await client.query(
            'UPDATE product_types SET name = $1, price = $2, image = $3, category_id = $4 WHERE id = $5 RETURNING *',
            [name, parseFloat(price), image, categoryId, id]
        );
        
        const updatedProductType = {
            id: result.rows[0].id,
            name: result.rows[0].name,
            price: parseFloat(result.rows[0].price),
            image: result.rows[0].image,
            category: category,
            businessUnit: result.rows[0].business_unit,
        }

        res.status(200).json(updatedProductType);
    } catch (err) {
        console.error('Failed to update product type:', err);
        if (err.code === '23505') {
             return res.status(409).json({ error: `A product type with the name "${name}" may already exist.` });
        }
        res.status(500).json({ error: 'Failed to update product type' });
    } finally {
        client.release();
    }
});

app.delete('/api/product-types/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const usageCheck = await pool.query('SELECT id FROM products WHERE product_type_id = $1 LIMIT 1', [id]);
        if (usageCheck.rows.length > 0) {
            return res.status(409).json({ error: 'Cannot delete: This product type is in use by one or more products.' });
        }

        const result = await pool.query('DELETE FROM product_types WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Product type not found.' });
        }
        res.status(204).send();
    } catch (err) {
        console.error('Failed to delete product type:', err);
        res.status(500).json({ error: 'Failed to delete product type' });
    }
});

// --- ALERT BANNERS ---
app.post('/api/alert-banners', authenticateToken, async (req, res) => {
    const { id, text, color, businessUnit } = req.body;
    if (!id || !text || !color || !businessUnit) {
        return res.status(400).json({ error: 'Missing required fields for alert banner.' });
    }
    try {
        const result = await pool.query(
            'INSERT INTO alert_banners (id, text, color, business_unit) VALUES ($1, $2, $3, $4) RETURNING *',
            [id, text, color, businessUnit]
        );
        res.status(201).json(formatRowKeys(result.rows[0]));
    } catch (err) {
        console.error('Failed to create alert banner:', err);
        res.status(500).json({ error: 'Failed to create alert banner' });
    }
});

app.put('/api/alert-banners/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { text, color } = req.body;
     if (!text || !color) {
        return res.status(400).json({ error: 'Text and color are required for update.' });
    }
    try {
        const result = await pool.query(
            'UPDATE alert_banners SET text = $1, color = $2 WHERE id = $3 RETURNING *',
            [text, color, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Alert banner not found.' });
        }
        res.status(200).json(formatRowKeys(result.rows[0]));
    } catch (err) {
        console.error('Failed to update alert banner:', err);
        res.status(500).json({ error: 'Failed to update alert banner' });
    }
});

app.delete('/api/alert-banners/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM alert_banners WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Alert banner not found.' });
        }
        res.status(204).send();
    } catch (err) {
        console.error('Failed to delete alert banner:', err);
        res.status(500).json({ error: 'Failed to delete alert banner' });
    }
});


// --- PRODUCTS ---
// Create a new product
app.post('/api/products', authenticateToken, async (req, res) => {
    const {
        name,
        description,
        productType, // This is the name
        category,    // This is the name
        sku,
        topTerpenes,
        genetics,
        feelsLike,
        alertBanner, // This is the ID
        dohType,
        businessUnit
    } = req.body;

    if (!name || !description || !productType || !category || !sku || !dohType || !businessUnit) {
        return res.status(400).json({ error: 'Missing required fields for product creation.' });
    }

    const client = await pool.connect();
    try {
        const ptResult = await client.query(
            'SELECT id FROM product_types WHERE name = $1 AND business_unit = $2',
            [productType, businessUnit]
        );
        if (ptResult.rows.length === 0) {
            return res.status(400).json({ error: `Product Type "${productType}" not found for business unit "${businessUnit}".` });
        }
        const productTypeId = ptResult.rows[0].id;

        const catResult = await client.query(
            'SELECT id FROM categories WHERE name = $1 AND business_unit = $2',
            [category, businessUnit]
        );
        if (catResult.rows.length === 0) {
            return res.status(400).json({ error: `Category "${category}" not found for business unit "${businessUnit}".` });
        }
        const categoryId = catResult.rows[0].id;

        const newProductId = `prod-${Date.now()}`;

        const insertQuery = `
            INSERT INTO products (
                id, name, description, sku, top_terpenes, genetics, feels_like, 
                doh_type, qty_in_stock, business_unit, product_type_id, 
                category_id, alert_banner_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *;
        `;
        const values = [
            newProductId, name, description, sku, topTerpenes, genetics, feelsLike,
            dohType, 0, // qty_in_stock is 0 by default for new products
            businessUnit, productTypeId, categoryId, alertBanner || null
        ];

        await client.query(insertQuery, values);
        
        const returnedProduct = {
            ...req.body,
            id: newProductId,
            qtyInStock: 0,
            alertBanner: alertBanner || null
        };

        res.status(201).json(returnedProduct);
    } catch (err) {
        console.error('Failed to create product:', err);
        res.status(500).json({ error: 'Failed to create product' });
    } finally {
        client.release();
    }
});

// Update an existing product
app.put('/api/products/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const {
        name,
        description,
        productType, // This is the name
        category,    // This is the name
        sku,
        topTerpenes,
        genetics,
        feelsLike,
        alertBanner, // This is the ID
        dohType,
        businessUnit
    } = req.body;

    if (!name || !description || !productType || !category || !sku || !dohType || !businessUnit) {
        return res.status(400).json({ error: 'Missing required fields for product update.' });
    }

    const client = await pool.connect();
    try {
        const ptResult = await client.query(
            'SELECT id FROM product_types WHERE name = $1 AND (business_unit = $2 OR ($2 = \'passion-flower\' AND business_unit = \'fairwinds\'))',
            [productType, businessUnit]
        );
        if (ptResult.rows.length === 0) {
            return res.status(400).json({ error: `Product Type "${productType}" not found for business unit "${businessUnit}".` });
        }
        const productTypeId = ptResult.rows[0].id;

        const catResult = await client.query(
            'SELECT id FROM categories WHERE name = $1 AND (business_unit = $2 OR ($2 = \'passion-flower\' AND business_unit = \'fairwinds\') OR ($2 = \'fairwinds\' AND business_unit = \'passion-flower\'))',
            [category, businessUnit]
        );
        if (catResult.rows.length === 0) {
            return res.status(400).json({ error: `Category "${category}" not found for business unit "${businessUnit}".` });
        }
        const categoryId = catResult.rows[0].id;

        const updateQuery = `
            UPDATE products SET
                name = $1, description = $2, sku = $3, top_terpenes = $4, genetics = $5,
                feels_like = $6, doh_type = $7, business_unit = $8, product_type_id = $9,
                category_id = $10, alert_banner_id = $11
            WHERE id = $12
            RETURNING *;
        `;
        const values = [
            name, description, sku, topTerpenes, genetics, feelsLike, dohType,
            businessUnit, productTypeId, categoryId, alertBanner || null, id
        ];

        const result = await client.query(updateQuery, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        const dbProduct = result.rows[0];
        const finalProduct = {
            id: dbProduct.id,
            name: dbProduct.name,
            description: dbProduct.description,
            sku: dbProduct.sku,
            topTerpenes: dbProduct.top_terpenes,
            genetics: dbProduct.genetics,
            feelsLike: dbProduct.feels_like,
            dohType: dbProduct.doh_type,
            qtyInStock: dbProduct.qty_in_stock,
            businessUnit: dbProduct.business_unit,
            productType,
            category,
            alertBanner: dbProduct.alert_banner_id,
        };

        res.status(200).json(finalProduct);
    } catch (err) {
        console.error('Failed to update product:', err);
        res.status(500).json({ error: 'Failed to update product' });
    } finally {
        client.release();
    }
});

// --- DISPENSARIES ---
app.post('/api/dispensaries', authenticateToken, async (req, res) => {
    const { name, address, phone, licenseNumber, email, salesRepEmail } = req.body;
    if (!name || !address || !licenseNumber || !email || !salesRepEmail) {
        return res.status(400).json({ error: 'Missing required fields for dispensary.' });
    }

    const client = await pool.connect();
    try {
        const userRes = await client.query('SELECT id, username FROM users WHERE email = $1', [salesRepEmail]);
        if (userRes.rows.length === 0) {
            return res.status(400).json({ error: `Sales rep with email ${salesRepEmail} not found.` });
        }
        const salesRepId = userRes.rows[0].id;
        const salesRepName = userRes.rows[0].username;

        const newId = `disp-${Date.now()}`;
        const result = await client.query(
            'INSERT INTO dispensaries (id, name, address, phone, license_number, email, sales_rep_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [newId, name, address, phone, licenseNumber, email, salesRepId]
        );
        
        const newDispensary = formatRowKeys(result.rows[0]);
        
        res.status(201).json({
            ...newDispensary,
            salesRepName: salesRepName,
            salesRepEmail: salesRepEmail,
        });

    } catch (err) {
        console.error('Failed to create dispensary:', err);
        if (err.code === '23505') { // unique_violation
            return res.status(409).json({ error: 'A dispensary with that license number or name may already exist.' });
        }
        res.status(500).json({ error: 'Failed to create dispensary' });
    } finally {
        client.release();
    }
});

app.put('/api/dispensaries/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, address, phone, licenseNumber, email, salesRepEmail } = req.body;
    if (!name || !address || !licenseNumber || !email || !salesRepEmail) {
        return res.status(400).json({ error: 'Missing required fields for dispensary update.' });
    }

    const client = await pool.connect();
    try {
        const userRes = await client.query('SELECT id, username FROM users WHERE email = $1', [salesRepEmail]);
        if (userRes.rows.length === 0) {
            return res.status(400).json({ error: `Sales rep with email ${salesRepEmail} not found.` });
        }
        const salesRepId = userRes.rows[0].id;
        const salesRepName = userRes.rows[0].username;

        const result = await client.query(
            'UPDATE dispensaries SET name = $1, address = $2, phone = $3, license_number = $4, email = $5, sales_rep_id = $6 WHERE id = $7 RETURNING *',
            [name, address, phone, licenseNumber, email, salesRepId, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Dispensary not found.' });
        }

        const updatedDispensary = formatRowKeys(result.rows[0]);
        
        res.status(200).json({
            ...updatedDispensary,
            salesRepName: salesRepName,
            salesRepEmail: salesRepEmail,
        });
    } catch (err) {
        console.error('Failed to update dispensary:', err);
        if (err.code === '23505') { // unique_violation
            return res.status(409).json({ error: 'A dispensary with that license number or name may already exist.' });
        }
        res.status(500).json({ error: 'Failed to update dispensary' });
    } finally {
        client.release();
    }
});

app.delete('/api/dispensaries/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM dispensaries WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Dispensary not found.' });
        }
        res.status(204).send();
    } catch (err) {
        console.error('Failed to delete dispensary:', err);
        res.status(500).json({ error: 'Failed to delete dispensary' });
    }
});

// --- USERS ---
app.post('/api/users', authenticateToken, async (req, res) => {
    const { username, email, password, roleId, profilePicture } = req.body;
    if (!username || !email || !password || !roleId) {
        return res.status(400).json({ error: 'Missing required fields for user.' });
    }
    const newId = `user-${Date.now()}`;
    try {
        const result = await pool.query(
            'INSERT INTO users (id, username, email, password, profile_picture, role_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, email, profile_picture, role_id',
            [newId, username, email, password, profilePicture || null, roleId]
        );
        res.status(201).json({ ...formatRowKeys(result.rows[0]), businessUnits: [] }); // Return with empty BUs for now
    } catch (err) {
        console.error('Failed to create user:', err);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

app.put('/api/users/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { username, email, password, roleId, profilePicture } = req.body;
    if (!username || !email || !roleId) {
        return res.status(400).json({ error: 'Missing required fields for user update.' });
    }
    try {
        const result = await pool.query(
            'UPDATE users SET username = $1, email = $2, password = $3, profile_picture = $4, role_id = $5 WHERE id = $6 RETURNING id, username, email, profile_picture, role_id, password',
            [username, email, password, profilePicture || null, roleId, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }
        res.status(200).json(formatRowKeys(result.rows[0]));
    } catch (err) {
        console.error('Failed to update user:', err);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

app.delete('/api/users/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }
        res.status(204).send();
    } catch (err) {
        console.error('Failed to delete user:', err);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// --- ROLES ---
app.post('/api/roles', authenticateToken, async (req, res) => {
    const { id, name, permissions } = req.body;
    if (!id || !name || !permissions) {
        return res.status(400).json({ error: 'Missing required fields for role.' });
    }
    try {
        const result = await pool.query(
            'INSERT INTO roles (id, name, permissions) VALUES ($1, $2, $3) RETURNING *',
            [id, name, permissions]
        );
        res.status(201).json(formatRowKeys(result.rows[0]));
    } catch (err) {
        console.error('Failed to create role:', err);
        res.status(500).json({ error: 'Failed to create role' });
    }
});

app.put('/api/roles/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, permissions } = req.body;
    if (!name || !permissions) {
        return res.status(400).json({ error: 'Name and permissions are required for update.' });
    }
    try {
        const result = await pool.query(
            'UPDATE roles SET name = $1, permissions = $2 WHERE id = $3 RETURNING *',
            [name, permissions, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Role not found.' });
        }
        res.status(200).json(formatRowKeys(result.rows[0]));
    } catch (err) {
        console.error('Failed to update role:', err);
        res.status(500).json({ error: 'Failed to update role' });
    }
});

app.delete('/api/roles/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM roles WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Role not found.' });
        }
        res.status(204).send();
    } catch (err) {
        console.error('Failed to delete role:', err);
        res.status(500).json({ error: 'Failed to delete role' });
    }
});

// --- SETTINGS ---
app.put('/api/settings/category-sort', authenticateToken, async (req, res) => {
    const { businessUnit, sortOrder } = req.body; // sortOrder is an array of {name, order}
    if (!businessUnit || !Array.isArray(sortOrder)) {
        return res.status(400).json({ error: 'Business unit and sort order array are required.' });
    }
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM category_sort WHERE business_unit = $1', [businessUnit]);
        for (const item of sortOrder) {
            await client.query(
                'INSERT INTO category_sort (business_unit, category_name, sort_order) VALUES ($1, $2, $3)',
                [businessUnit, item.name, item.order]
            );
        }
        await client.query('COMMIT');
        res.status(200).json({ message: 'Sort order updated successfully.' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Failed to update category sort order:', err);
        res.status(500).json({ error: 'Failed to update category sort order.' });
    } finally {
        client.release();
    }
});

app.put('/api/settings/mobile-nav', authenticateToken, async (req, res) => {
    const mobileNavConfig = req.body;
    if (!Array.isArray(mobileNavConfig)) {
        return res.status(400).json({ error: 'Request body must be an array of nav items.' });
    }
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM mobile_nav_config');
        for (const item of mobileNavConfig) {
            await client.query(
                'INSERT INTO mobile_nav_config (id, label, icon, is_visible, display_order) VALUES ($1, $2, $3, $4, $5)',
                [item.id, item.label, item.icon, item.isVisible, item.order]
            );
        }
        await client.query('COMMIT');
        res.status(200).json({ message: 'Mobile nav configuration updated.' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Failed to update mobile nav config:', err);
        res.status(500).json({ error: 'Failed to update mobile nav config.' });
    } finally {
        client.release();
    }
});

app.put('/api/settings/inventory-threshold', authenticateToken, async (req, res) => {
    const { businessUnit, threshold } = req.body;
    const buKey = businessUnit === 'sunshine' ? 'sunshine' : 'fairwinds';
    const key = `inventory_threshold_${buKey}`;
    
    if (threshold === undefined) {
        return res.status(400).json({ error: 'Threshold value is required.' });
    }
    try {
        await pool.query(
            'INSERT INTO application_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
            [key, threshold.toString()]
        );
        res.status(200).json({ message: 'Inventory threshold updated.' });
    } catch (err) {
        console.error('Failed to update inventory threshold:', err);
        res.status(500).json({ error: 'Failed to update inventory threshold.' });
    }
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});