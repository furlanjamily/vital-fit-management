import type { LucideIcon } from "lucide-react";
import type { UserRole } from "@/components/users/users.types";
import {
  getMobileNavigationRoutes,
  isClassesRouteActive,
  isNavActive,
  navigationRoutes,
  type RouteItem,
} from "@/config/navigation";

export type AppNavItem = {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: string;
};

export type { RouteItem };
export { isNavActive, isClassesRouteActive, navigationRoutes };

/** Rotas principais da sidebar (sem Classes drawer e sem utility). */
export const mainNavItems: AppNavItem[] = navigationRoutes
  .filter((route) => !route.isDrawerTrigger && !route.isUtility)
  .map(({ icon, label, path }) => ({
    icon,
    label,
    href: path,
  }));

/** @deprecated Classes vêm da API via ClassesSidebarSection / ClassesDrawer. */
export type ClassNavItem = {
  label: string;
  count: string;
  href: string;
};

/** @deprecated Prefer listClassesNavAction / useClassesNavItems. */
export const classNavItems: ClassNavItem[] = [];

export const utilityNavItems: AppNavItem[] = navigationRoutes
  .filter((route) => route.isUtility)
  .map(({ icon, label, path }) => ({
    icon,
    label,
    href: path,
  }));

const USERS_NAV_HREF = "/users";

export function getUtilityNavItemsForRole(role: UserRole | null): AppNavItem[] {
  return utilityNavItems.filter(
    (item) => item.href !== USERS_NAV_HREF || role === "SUPER_ADMIN",
  );
}

/** Bottom bar: rotas com `showInMobileNav` (Classes = drawer; utility após Classes). */
export function getMobileNavItemsForRole(role: UserRole | null): RouteItem[] {
  return getMobileNavigationRoutes(role === "SUPER_ADMIN");
}

export const profileHref = "/profile";

/** @deprecated Use getMobileNavItemsForRole(role). */
export const mobileNavItems: RouteItem[] = getMobileNavItemsForRole("SUPER_ADMIN");
