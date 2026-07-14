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
