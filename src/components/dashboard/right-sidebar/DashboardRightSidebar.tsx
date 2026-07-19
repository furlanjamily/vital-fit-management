"use client";

import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { CategoriesSection } from "@/components/dashboard/right-sidebar/CategoriesSection";
import { MiniCalendar } from "@/components/dashboard/right-sidebar/MiniCalendar";
import { MyCalendarsSection } from "@/components/dashboard/right-sidebar/MyCalendarsSection";
import { UpNextCard } from "@/components/dashboard/right-sidebar/UpNextCard";
import { useDashboardRightSidebar } from "@/components/dashboard/right-sidebar/useDashboardRightSidebar";
import { UserAvatar } from "@/components/users/UserAvatar";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { useToastOnError } from "@/hooks/useToastOnError";
import { cn } from "@/lib/cn";

const SECTION_CARD_CLASS = "shrink-0 w-full min-w-0";

export function DashboardRightSidebar() {
  const {
    profile,
    upNextEvent,
    upNextCountdown,
    upcomingTodayCount,
    categoryCounts,
    loadError,
    isLoading,
  } = useDashboardRightSidebar();

  useToastOnError(loadError);

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <header className="flex shrink-0 items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <UserAvatar
            name={profile?.displayName ?? "Usuário"}
            avatarUrl={profile?.avatarUrl ?? null}
            className="size-11 shrink-0 border border-white/20"
            textClassName="text-xs"
          />
          <div className="min-w-0 flex-1">
            <p className={cn(glassTextStyles.entityName, "truncate text-sm font-bold leading-tight")}>
              {profile?.displayName ?? "Carregando…"}
            </p>
            <p className={cn("truncate text-[11px] leading-tight", glassText.muted)}>
              {profile?.roleLabel ?? "Equipe VitalFit"}
            </p>
          </div>
        </div>

        <Link
          href="/agenda"
          className="relative grid size-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.06] transition hover:scale-[1.03] hover:border-orange-400/25 hover:bg-orange-500/10"
          aria-label="Abrir agenda"
        >
          <CalendarDays className="size-4 text-orange-600" strokeWidth={2} />
          {upcomingTodayCount > 0 ? (
            <span className={cn("absolute -right-1 -top-1 grid min-w-[18px] place-items-center rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-1 py-0.5 text-[9px] font-bold leading-none shadow-[0_4px_12px_rgba(249,115,22,0.45)]", glassText.primary)}>
              {upcomingTodayCount > 9 ? "9+" : upcomingTodayCount}
            </span>
          ) : null}
        </Link>
      </header>

      {loadError ? (
        <p className={cn(SECTION_CARD_CLASS, "text-xs", glassText.muted)}>{loadError}</p>
      ) : null}

      <MiniCalendar className={SECTION_CARD_CLASS} />

      <UpNextCard
        className={SECTION_CARD_CLASS}
        event={upNextEvent}
        countdown={upNextCountdown}
        isLoading={isLoading}
      />

      <MyCalendarsSection className={SECTION_CARD_CLASS} categoryCounts={categoryCounts} />

      <CategoriesSection className={SECTION_CARD_CLASS} categoryCounts={categoryCounts} />
    </div>
  );
}
