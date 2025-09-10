import { useMemo } from 'react';

type SortDirection = 'ascending' | 'descending';

interface SortConfig<T> {
    key: keyof T | string;
    direction: SortDirection;
}

interface GroupedData<T> {
    groupTitle: string;
    items: T[];
    count: number;
}

interface UseDataProcessorProps<T> {
    data: T[];
    searchTerm?: string;
    searchKeys?: (keyof T)[];
    sortConfig: SortConfig<T>;
    groupKey?: keyof T | ((item: T) => string) | undefined | "None";
    filters?: Record<string, any>;
}

export const useDataProcessor = <T extends Record<string, any>>({
    data,
    searchTerm,
    searchKeys,
    sortConfig,
    groupKey,
    filters
}: UseDataProcessorProps<T>): GroupedData<T>[] => {

    return useMemo(() => {
        let processedData = [...data];

        // 1. Filtering by search term
        if (searchTerm && searchKeys && searchKeys.length > 0) {
            const lowercasedFilter = searchTerm.toLowerCase();
            processedData = processedData.filter(item =>
                searchKeys.some(key =>
                    String(item[key]).toLowerCase().includes(lowercasedFilter)
                )
            );
        }
        
        // 2. Filtering by specific filter criteria
        if (filters) {
             processedData = processedData.filter(item => {
                return Object.entries(filters).every(([key, value]) => {
                    if (value === null || value === undefined) return true;
                    return item[key] === value;
                });
            });
        }

        // 3. Sorting
        if (sortConfig.key) {
            processedData.sort((a, b) => {
                const aVal = a[sortConfig.key as keyof T];
                const bVal = b[sortConfig.key as keyof T];

                if (typeof aVal === 'string' && typeof bVal === 'string') {
                    return sortConfig.direction === 'ascending' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                }
                
                if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }

        // 4. Grouping
        if (!groupKey || groupKey === "None") {
            return [{ groupTitle: "All", items: processedData, count: processedData.length }];
        }

        const getGroupKeyValue = (item: T) => {
            if (typeof groupKey === 'function') {
                return groupKey(item);
            }
            return item[groupKey] as string;
        }
        
        const grouped = processedData.reduce((acc, item) => {
            const key = getGroupKeyValue(item);
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
        }, {} as Record<string, T[]>);

        return Object.entries(grouped).map(([title, items]) => ({
            groupTitle: title.charAt(0).toUpperCase() + title.slice(1),
            items: items,
            count: items.length
        })).sort((a, b) => a.groupTitle.localeCompare(b.groupTitle));

    }, [data, searchTerm, searchKeys, sortConfig, groupKey, filters]);
};
