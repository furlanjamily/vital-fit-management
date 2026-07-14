"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavUserMenu } from "@/components/app/NavUserMenu";
import { ClassesSidebarSection } from "@/components/classes/ClassesSidebarSection";
import {
  isNavActive,
  mainNavItems,
  utilityNavItems,
} from "@/config/app-nav.config";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

export function LeftSidebarPanel() {
  const pathname = usePathname();

  return (
    <div className="h-full w-full overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.07] shadow-2xl shadow-orange-950/20 backdrop-blur-[12px]">
      <div className="flex h-full flex-col overflow-y-auto p-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link href="/dashboard" className="flex shrink-0 items-center gap-3 transition hover:opacity-90">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/vital-fit-logo.png"
            alt=""
            className="h-11 w-auto shrink-0 object-contain"
          />
          <div>
            <p className={cn(glassTextStyles.panelTitle, "text-sm tracking-[-0.03em]")}>
              VITAL FIT
            </p>
            <p className={cn(glassText.muted, "text-[10px]")}>Workspace</p>
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
                  "flex items-center justify-between rounded-2xl px-4 py-4.5 text-xs font-semibold transition hover:bg-white/8",
                  glassText.secondary,
                  active && cn("bg-white/8", glassText.primary),
                )}
              >
                <span className="flex items-center gap-3">
                  <item.icon className="size-4" />
                  {item.label}
                </span>
                {item.badge ? (
                  <span className={cn("grid size-5 place-items-center rounded-full bg-orange-500 text-[10px] font-bold", glassText.primary)}>
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <ClassesSidebarSection />

        {utilityNavItems.map((item) => {
          const active = isNavActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between rounded-2xl px-4 py-4.5 text-xs font-semibold transition hover:bg-white/8",
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
    </div>
  );
}
