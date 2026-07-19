"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavUserMenu } from "@/components/app/NavUserMenu";
import { BrandWordmark } from "@/components/brand/BrandWordmark";
import { ClassesSidebarSection } from "@/components/classes/ClassesSidebarSection";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import {
  getUtilityNavItemsForRole,
  isNavActive,
  mainNavItems,
} from "@/config/app-nav.config";
import { glassText } from "@/config/glass-typography";
import { useSessionUserRole } from "@/hooks/useSessionUserRole";
import { cn } from "@/lib/cn";

export function LeftSidebarPanel() {
  const pathname = usePathname();
  const { role } = useSessionUserRole();
  const visibleUtilityItems = getUtilityNavItemsForRole(role);

  return (
    <GlassPanel
      variant="hero"
      intensity="high"
      elevation="base"
      className="h-full w-full overflow-hidden rounded-[28px] shadow-2xl shadow-orange-950/20"
    >
      <div className="flex h-full flex-col overflow-y-auto p-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link href="/dashboard" className="flex shrink-0 items-center gap-3 transition hover:opacity-90">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/vital-fit-logo.png"
            alt=""
            className="h-11 w-auto shrink-0 object-contain"
          />
          <div>
            <BrandWordmark className="text-[1.35rem]" />
            <p className={cn(glassText.muted, "mt-0.5 text-[10px]")}>Workspace</p>
          </div>
        </Link>

        <nav className="mt-8 grid shrink-0 gap-2">
          {mainNavItems.map((item) => {
            const active = isNavActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between rounded-2xl px-4 py-4 text-xs font-semibold transition hover:bg-white/8",
                  glassText.secondary,
                  active && cn("bg-white/8", glassText.primary),
                )}
              >
                <span className="flex items-center gap-3">
                  <item.icon className="size-4" />
                  {item.label}
                </span>
                {item.badge ? (
                  <span className={cn("grid size-5 place-items-center rounded-full bg-orange-600 text-[10px] font-bold", glassText.primary)}>
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <ClassesSidebarSection />

        {visibleUtilityItems.map((item) => {
          const active = isNavActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "mt-2 flex items-center justify-between rounded-2xl px-4 py-4 text-xs font-semibold transition hover:bg-white/8",
                glassText.secondary,
                active && cn("bg-white/8", glassText.primary),
              )}
            >
              <span className="flex items-center gap-3">
                <item.icon className="size-4" />
                {item.label}
              </span>
            </Link>
          );
        })}
        <div className="mt-4">
          <NavUserMenu />
        </div>

      </div>
    </GlassPanel>
  );
}
