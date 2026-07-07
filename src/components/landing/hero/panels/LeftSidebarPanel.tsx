"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Dumbbell, Moon, Sun } from "lucide-react";
import { NavUserMenu } from "@/components/app/NavUserMenu";
import {
  classNavItems,
  isNavActive,
  mainNavItems,
  utilityNavItems,
} from "@/config/app-nav.config";
import { cn } from "@/lib/cn";

/**
 * Flat glass plate: no extrusion, no side shadows.
 * Outer div = fixed glass shell. Inner div = hidden vertical scroll.
 */
export function LeftSidebarPanel() {
  const pathname = usePathname();

  return (
    <div className="h-full w-full overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.07] shadow-2xl shadow-black/40 backdrop-blur-[12px]">
      <div className="flex h-full flex-col overflow-y-auto p-5 pb-12 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link href="/dashboard" className="flex shrink-0 items-center gap-3 transition hover:opacity-90">
          <span className="grid size-9 shrink-0 place-items-center rounded-full border border-white/20 bg-white/12">
            <Dumbbell className="size-4 text-white" />
          </span>
          <div>
            <p className="text-sm font-semibold tracking-[-0.03em] text-white">
              FitnessUp
            </p>
            <p className="text-[10px] text-white/48">Workspace</p>
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
                  "flex items-center justify-between rounded-2xl px-2 py-2.5 text-xs font-medium text-white/42 transition",
                  active && "bg-white/8 text-white",
                )}
              >
                <span className="flex items-center gap-3">
                  <item.icon className="size-4" />
                  {item.label}
                </span>
                {item.badge ? (
                  <span className="grid size-5 place-items-center rounded-full bg-[#176dff] text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-9 shrink-0">
          <p className="mb-4 text-xs font-semibold text-white/72">Classes</p>
          <div className="grid gap-2">
            {classNavItems.map((item) => {
              const active = isNavActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between rounded-2xl px-2 py-2 text-xs transition",
                    active ? "bg-white/8 text-white" : "text-white/38",
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span className="size-3 rounded-full border border-white/22" />
                    {item.label}
                  </span>
                  <span className="grid size-5 place-items-center rounded-full bg-[#176dff] text-[10px] font-bold text-white">
                    {item.count}
                  </span>
                </Link>
              );
            })}
          </div>
          <button
            type="button"
            className="mt-4 flex items-center gap-3 px-2 text-xs font-semibold text-white/64"
          >
            <ChevronDown className="size-4" />
            Show more
          </button>
        </div>

        <div className="mt-auto grid shrink-0 gap-2 pt-10">
          {utilityNavItems.map((item) => {
            const active = isNavActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-2 py-2.5 text-xs font-semibold text-white/72 transition hover:bg-white/8",
                  active && "bg-white/8 text-white",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}

          <NavUserMenu />

        </div>
      </div>
    </div>
  );
}
