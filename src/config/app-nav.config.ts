import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CalendarDays,
  Grid2X2,
  HelpCircle,
  LineChart,
  Settings,
  UsersRound,
  User2Icon,
  CircleDollarSignIcon,
} from "lucide-react";
import type { UserRole } from "@/components/users/users.types";

export type AppNavItem = {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: string;
};

export type ClassNavItem = {
  label: string;
  count: string;
  href: string;
};

export const mainNavItems: AppNavItem[] = [
  { icon: Grid2X2, label: "Dashboard", href: "/dashboard" },
  { icon: CircleDollarSignIcon, label: "Financeiro", href: "/finance" },
  { icon: CalendarDays, label: "Agenda", href: "/agenda" },
];

export const classNavItems: ClassNavItem[] = [
  { label: "Crossfit", count: "2", href: "/classes/crossfit" },
  { label: "TRX", count: "11", href: "/classes/trx" },
  { label: "Yoga", count: "2", href: "/classes/yoga" },
];

export const utilityNavItems: AppNavItem[] = [
  { icon: UsersRound, label: "Alunos", href: "/members" },
  { icon: UsersRound, label: "Profissionais", href: "/professionals" },
  { icon: User2Icon, label: "Usuários", href: "/users" },
  { icon: Settings, label: "Configurações", href: "/settings" },
];

const USERS_NAV_HREF = "/users";

export function getUtilityNavItemsForRole(role: UserRole | null): AppNavItem[] {
  return utilityNavItems.filter(
    (item) => item.href !== USERS_NAV_HREF || role === "SUPER_ADMIN",
  );
}

export function getMobileNavItemsForRole(role: UserRole | null): AppNavItem[] {
  return [
    ...mainNavItems,
    ...classNavItems.map(({ label, href }) => ({
      icon: BarChart3,
      label,
      href,
    })),
    ...getUtilityNavItemsForRole(role),
  ];
}

export const profileHref = "/profile";

/** @deprecated Use getMobileNavItemsForRole(role) — inclui filtro RBAC. */
export const mobileNavItems: AppNavItem[] = getMobileNavItemsForRole("SUPER_ADMIN");

export function isNavActive(pathname: string, href: string) {
  return pathname === href;
}
