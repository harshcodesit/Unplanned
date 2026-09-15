export interface NavItem {
  id: "home" | "vibes" | "trail" | "profile" | "auth";
  label: string;
  path: string;
  requiresAuth?: boolean;
}
