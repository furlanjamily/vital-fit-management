"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { dispatchOpenScheduleModal } from "@/components/classes/schedule-modal-events";
import { useClassesNavItems } from "@/components/classes/useClassesNavItems";
import { ResponsiveModal } from "@/components/common/modal/ResponsiveModal";
import { GlassButton } from "@/components/common/form";
import { Skeleton } from "@/components/common/skeleton";
import { isNavActive } from "@/config/navigation";
import { glassText } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

type ClassesDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ClassesDrawer({ open, onOpenChange }: ClassesDrawerProps) {
  const pathname = usePathname();
  const { classItems, loadError, isPending } = useClassesNavItems({
    enabled: open,
  });

  return (
    <ResponsiveModal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title="Classes"
      size="md"
      headerActions={
        <GlassButton
          size="sm"
          variant="subtle"
          shape="pill"
          className="h-8 px-3"
          aria-label="Adicionar aula"
          onClick={() => {
            onOpenChange(false);
            dispatchOpenScheduleModal({ defaultClassId: null });
          }}
        >
          <Plus className="size-3.5" aria-hidden="true" />
        </GlassButton>
      }
    >
      {loadError ? (
        <p className={cn("mb-2 text-xs", glassText.muted)}>{loadError}</p>
      ) : null}

      <div
        className={cn(
          "min-h-0",
          isPending && classItems.length > 0 && "opacity-70",
        )}
      >
        <div className="grid gap-1">
          {isPending && classItems.length === 0
            ? Array.from({ length: 3 }, (_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-3 py-3"
                >
                  <Skeleton className="h-3.5 w-24 rounded-full" />
                  <Skeleton className="size-6 rounded-full" />
                </div>
              ))
            : classItems.map((item) => {
                const href = `/classes/${item.slug}`;
                const active = isNavActive(pathname, href);

                return (
                  <Link
                    key={item.id}
                    href={href}
                    onClick={() => onOpenChange(false)}
                    className={cn(
                      "flex items-center justify-between rounded-2xl px-3 py-3 text-sm transition",
                      active
                        ? cn("bg-white/10", glassText.primary)
                        : cn(glassText.muted, "hover:bg-white/6"),
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={cn(
                          "size-2.5 rounded-full border",
                          active
                            ? "border-orange-400 bg-orange-500"
                            : "border-white/22 bg-transparent",
                        )}
                      />
                      {item.name}
                    </span>
                    <span className="grid min-w-6 place-items-center rounded-full bg-[#FF8A35] px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {item.appointmentCount}
                    </span>
                  </Link>
                );
              })}
        </div>

        {!isPending && classItems.length === 0 && !loadError ? (
          <p className={cn("px-3 py-6 text-center text-sm", glassText.muted)}>
            Nenhuma classe cadastrada ainda.
          </p>
        ) : null}
      </div>
    </ResponsiveModal>
  );
}
