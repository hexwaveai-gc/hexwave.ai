// Types for sidebar components

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  matchPaths?: string[]; // Additional paths that should activate this item
  badge?: string;
  requiresAuth?: boolean; // Whether this route requires authentication
}
