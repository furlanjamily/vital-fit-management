"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NavUserMenu } from "@/components/app/NavUserMenu";
import { ClassesDrawer } from "@/components/classes/ClassesDrawer";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import {
  getMobileNavItemsForRole,
  isClassesRouteActive,
  isNavActive,
  type RouteItem,
} from "@/config/app-nav.config";
import { glassText } from "@/config/glass-typography";
import { useSessionUserRole } from "@/hooks/useSessionUserRole";
import { cn } from "@/lib/cn";

function NavItemButton({
  item,
  active,
  onDrawerOpen,
}: {
  item: RouteItem;
  active: boolean;
  onDrawerOpen: () => void;
}) {
  const { icon: Icon, label, path, isDrawerTrigger } = item;

  const className = cn(
    "flex shrink-0 flex-col items-center gap-1 rounded-2xl px-2 py-2 transition-colors",
    active && "bg-orange-500/18",
  );

  const content = (
    <>
      <Icon
        className={cn(
          "size-5 transition-colors",
          active ? glassText.primary : glassText.muted,
        )}
      />
      <span
        className={cn(
          "text-[9px] font-semibold leading-none transition-colors",
          active ? glassText.secondary : glassText.muted,
        )}
      >
        {label}
      </span>
      {active ? (
        <span className="mt-0.5 h-0.5 w-4 rounded-full bg-orange-500" />
      ) : null}
    </>
  );

  if (isDrawerTrigger) {
    return (
      <button type="button" onClick={onDrawerOpen} className={className}>
        {content}
      </button>
    );
  }

  return (
    <Link href={path} className={className}>
      {content}
    </Link>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { role } = useSessionUserRole();
  const navItems = getMobileNavItemsForRole(role);
  const [classesDrawerOpen, setClassesDrawerOpen] = useState(false);

  if (pathname === "/login") {
    return null;
  }

  return (
    <>
      <nav
        aria-label="Mobile navigation"
        className="z-50 box-border block w-full shrink-0 px-[max(1rem,env(safe-area-inset-left),env(safe-area-inset-right))] pb-[max(var(--mobile-nav-bottom-gap),env(safe-area-inset-bottom))] lg:hidden"
      >
        <GlassPanel
          variant="subtle"
          intensity="medium"
          elevation="floating"
          className="w-full overflow-hidden rounded-4xl shadow-[0_16px_56px_rgba(255,122,0,0.12)]"
        >
          <div className="flex w-full items-center py-3">
            <div className="min-w-0 flex-1 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex w-max items-center gap-1 px-4">
                {navItems.map((item) => {
                  const active = item.isDrawerTrigger
                    ? classesDrawerOpen || isClassesRouteActive(pathname)
                    : isNavActive(pathname, item.path);

                  return (
                    <NavItemButton
                      key={item.path}
                      item={item}
                      active={active}
                      onDrawerOpen={() => setClassesDrawerOpen(true)}
                    />
                  );
                })}
              </div>
            </div>

            <div className="mx-0.5 h-8 w-px shrink-0 rounded-full bg-white/10" />

            <div className="mr-3 ml-2 shrink-0">
              <NavUserMenu compact />
            </div>
          </div>
        </GlassPanel>
      </nav>

      <ClassesDrawer
        open={classesDrawerOpen}
        onOpenChange={setClassesDrawerOpen}
      />
    </>
  );
}

/** Alias alinhado à nomenclatura do design system. */
export { MobileBottomNav as MobileNavbar };
