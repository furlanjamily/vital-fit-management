"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { profileAvatar } from "@/components/landing/hero/data/heroScene.mock";
import {
  isNavActive,
  mobileNavItems,
  profileHref,
} from "@/config/app-nav.config";
import { cn } from "@/lib/cn";

export function MobileBottomNav() {
  const pathname = usePathname();

  if (pathname === "/login") {
    return null;
  }

  return (
    <nav
      aria-label="Mobile navigation"
      className="z-50 box-border block w-full shrink-0 px-[max(1rem,env(safe-area-inset-left),env(safe-area-inset-right))] pb-[max(var(--mobile-nav-bottom-gap),env(safe-area-inset-bottom))] lg:hidden"
    >
      <div className="w-full overflow-hidden rounded-4xl border border-white/10 bg-black/52 shadow-[0_16px_56px_rgba(0,0,0,0.52)] backdrop-blur-2xl">
        <div className="overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max min-w-full items-center py-3">
            <div className="w-4 shrink-0" aria-hidden="true" />

            <div className="flex min-w-0 flex-1 items-center justify-between gap-1">
              {mobileNavItems.map(({ icon: Icon, label, href, badge }) => {
                const active = isNavActive(pathname, href);

                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex shrink-0 flex-col items-center gap-1 rounded-2xl px-2 py-2 transition-colors",
                      active && "bg-[#176dff]/18",
                    )}
                  >
                    <div className="relative">
                      <Icon
                        className={cn(
                          "size-5 transition-colors",
                          active ? "text-white" : "text-white/38",
                        )}
                      />
                      {badge && (
                        <span className="absolute -right-1.5 -top-1.5 grid size-4 place-items-center rounded-full bg-[#176dff] text-[8px] font-bold text-white">
                          {badge}
                        </span>
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-[9px] font-semibold leading-none transition-colors",
                        active ? "text-white/80" : "text-white/28",
                      )}
                    >
                      {label}
                    </span>
                    {active && (
                      <span className="mt-0.5 h-0.5 w-4 rounded-full bg-[#176dff]" />
                    )}
                  </Link>
                );
              })}

              <div className="mx-0.5 h-8 w-px shrink-0 rounded-full bg-white/10" />

              <Link
                href={profileHref}
                className={cn(
                  "flex shrink-0 flex-col items-center gap-1 rounded-2xl px-2 py-2 transition-colors",
                  isNavActive(pathname, profileHref) && "bg-[#176dff]/18",
                )}
              >
                <div
                  className={cn(
                    "size-7 rounded-full border-2 bg-cover bg-center transition-colors",
                    isNavActive(pathname, profileHref)
                      ? "border-white"
                      : "border-white/28",
                  )}
                  style={{ backgroundImage: `url(${profileAvatar})` }}
                />
                <span
                  className={cn(
                    "text-[9px] font-semibold leading-none transition-colors",
                    isNavActive(pathname, profileHref)
                      ? "text-white/80"
                      : "text-white/28",
                  )}
                >
                  Profile
                </span>
                {isNavActive(pathname, profileHref) && (
                  <span className="mt-0.5 h-0.5 w-4 rounded-full bg-[#176dff]" />
                )}
              </Link>
            </div>

            <div className="w-4 shrink-0" aria-hidden="true" />
          </div>
        </div>
      </div>
    </nav>
  );
}
