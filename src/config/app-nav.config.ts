import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Grid2X2,
  HelpCircle,
  LineChart,
  Settings,
  UsersRound,
} from "lucide-react";

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
  { icon: UsersRound, label: "Community", href: "/community", badge: "3" },
  { icon: LineChart, label: "Analytics", href: "/analytics" },
  { icon: UsersRound, label: "Members", href: "/members" },
];

export const classNavItems: ClassNavItem[] = [
  { label: "Crossfit", count: "2", href: "/classes/crossfit" },
  { label: "TRX", count: "11", href: "/classes/trx" },
  { label: "Yoga", count: "2", href: "/classes/yoga" },
];

export const utilityNavItems: AppNavItem[] = [
  { icon: HelpCircle, label: "Help", href: "/help" },
  { icon: Settings, label: "Setting", href: "/settings" },
];

export const profileHref = "/profile";

export const mobileNavItems: AppNavItem[] = [
  ...mainNavItems,
  ...classNavItems.map(({ label, href }) => ({
    icon: BarChart3,
    label,
    href,
  })),
  ...utilityNavItems,
];

export function isNavActive(pathname: string, href: string) {
  return pathname === href;
}
