import type { LucideIcon } from "lucide-react";
import {
  BicepsFlexed,
  CalendarDays,
  CircleDollarSignIcon,
  Dumbbell,
  Grid2X2,
  Settings,
  UserCog,
  Users,
} from "lucide-react";

export type RouteItem = {
  label: string;
  path: string;
  icon: LucideIcon;
  /** Aparece na bottom bar móvel. */
  showInMobileNav: boolean;
  /** Se true, não navega — abre o Classes drawer. */
  isDrawerTrigger?: boolean;
  /** Seção utility da sidebar (Alunos, Config, etc.). */
  isUtility?: boolean;
  /** Visível na nav apenas para SUPER_ADMIN. */
  requiresSuperAdmin?: boolean;
};

/**
 * Fonte única de rotas (desktop sidebar + mobile bottom bar).
 * Classes no mobile é drawer trigger; no desktop a lista fica na sidebar.
 */
export const navigationRoutes: RouteItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: Grid2X2,
    showInMobileNav: true,
  },
  {
    label: "Financeiro",
    path: "/finance",
    icon: CircleDollarSignIcon,
    showInMobileNav: true,
  },
  {
    label: "Agenda",
    path: "/agenda",
    icon: CalendarDays,
    showInMobileNav: true,
  },
  {
    label: "Classes",
    path: "/classes",
    icon: Dumbbell,
    showInMobileNav: true,
    isDrawerTrigger: true,
  },
  {
    label: "Alunos",
    path: "/members",
    icon: Users,
    showInMobileNav: true,
    isUtility: true,
  },
  {
    label: "Profissionais",
    path: "/professionals",
    icon: BicepsFlexed,
    showInMobileNav: true,
    isUtility: true,
  },
  {
    label: "Usuários",
    path: "/users",
    icon: UserCog,
    showInMobileNav: true,
    isUtility: true,
    requiresSuperAdmin: true,
  },
  {
    label: "Configurações",
    path: "/settings",
    icon: Settings,
    showInMobileNav: true,
    isUtility: true,
  },
];

export function getMobileNavigationRoutes(
  isSuperAdmin: boolean,
): RouteItem[] {
  return navigationRoutes.filter(
    (route) =>
      route.showInMobileNav &&
      (!route.requiresSuperAdmin || isSuperAdmin),
  );
}

export function isNavActive(pathname: string, href: string) {
  return pathname === href;
}

/** Ativo na tab Classes quando o drawer está aberto ou a rota é de classe. */
export function isClassesRouteActive(pathname: string) {
  return pathname === "/classes" || pathname.startsWith("/classes/");
}
