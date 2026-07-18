"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { useState } from "react";
import { useClassesNavItems } from "@/components/classes/useClassesNavItems";
import { GhostButton, IconButton } from "@/components/common/form";
import { Skeleton } from "@/components/common/skeleton";
import { useScheduleModal } from "@/components/classes/ScheduleModalProvider";
import { isNavActive } from "@/config/navigation";
import { glassText } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

const VISIBLE_COUNT = 3;

export function ClassesSidebarSection() {
  const pathname = usePathname();
  const { openScheduleModal } = useScheduleModal();
  const [showAllClasses, setShowAllClasses] = useState(false);
  const { classItems, loadError, isPending } = useClassesNavItems();

  const visibleItems = showAllClasses
    ? classItems
    : classItems.slice(0, VISIBLE_COUNT);
  const hasHiddenItems = classItems.length > VISIBLE_COUNT;

  return (
    <div className="mt-3 shrink-0">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className={cn(glassText.secondary, "text-xs font-semibold")}>Classes</p>
        <IconButton
          size="sm"
          variant="glass"
          aria-label="Adicionar aula"
          onClick={() => openScheduleModal({ defaultClassId: null })}
        >
          <Plus className="size-3.5" aria-hidden="true" />
        </IconButton>
      </div>

      {loadError ? (
        <p className={cn("mb-2 text-[10px]", glassText.muted)}>{loadError}</p>
      ) : null}

      <div className={cn("grid gap-2", isPending && classItems.length > 0 && "opacity-70")}>
        {isPending && classItems.length === 0
          ? Array.from({ length: VISIBLE_COUNT }, (_, index) => (
              <div key={index} className="flex items-center justify-between px-2 py-2">
                <Skeleton className="h-3 w-20 rounded-full" />
                <Skeleton className="size-5 rounded-full" />
              </div>
            ))
          : visibleItems.map((item) => {
              const href = `/classes/${item.slug}`;
              const active = isNavActive(pathname, href);

              return (
                <Link
                  key={item.id}
                  href={href}
                  className={cn(
                    "flex items-center justify-between rounded-2xl px-2 py-2 text-xs transition",
                    active ? cn("bg-white/8", glassText.primary) : glassText.muted,
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span className="size-3 rounded-full border border-white/22" />
                    {item.name}
                  </span>
                  <span
                    className={cn(
                      "grid size-5 place-items-center rounded-full bg-orange-500 text-[10px] font-bold",
                      glassText.primary,
                    )}
                  >
                    {item.appointmentCount}
                  </span>
                </Link>
              );
            })}
      </div>

      {hasHiddenItems ? (
        <GhostButton
          size="sm"
          className={cn(
            "mt-4 justify-start font-semibold hover:bg-transparent hover:text-glass-secondary",
            glassText.secondary,
          )}
          rightIcon={showAllClasses ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          onClick={() => setShowAllClasses((current) => !current)}
        >
          {showAllClasses ? "Exibir menos" : "Exibir mais"}
        </GhostButton>
      ) : null}
    </div>
  );
}
