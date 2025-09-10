import React from 'react';
import { Store, Package, Inbox, Users, ShieldCheck, RefreshCw, Layers, ListOrdered, Tag, Smartphone, Folder } from "lucide-react";

// FIX: Explicitly typed the props of the React elements in iconMap to allow cloning with a className prop,
// resolving the TypeScript overload error.
// FIX: Replaced JSX syntax with `React.createElement` calls to resolve parsing errors in a .ts file that is not treated as TSX.
export const iconMap: { [key: string]: React.ReactElement<{ className?: string }> } = {
  Store: React.createElement(Store),
  Package: React.createElement(Package),
  Inbox: React.createElement(Inbox),
  Users: React.createElement(Users),
  ShieldCheck: React.createElement(ShieldCheck),
  RefreshCw: React.createElement(RefreshCw),
  Layers: React.createElement(Layers),
  ListOrdered: React.createElement(ListOrdered),
  Tag: React.createElement(Tag),
  Smartphone: React.createElement(Smartphone),
  Folder: React.createElement(Folder),
};