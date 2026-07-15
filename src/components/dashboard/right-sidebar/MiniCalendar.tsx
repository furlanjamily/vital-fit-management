"use client";

import { useState } from "react";
import Link from "next/link";
import { DayPicker } from "react-day-picker";
import { ptBR } from "date-fns/locale";
import { miniCalendarClassNames } from "@/components/dashboard/right-sidebar/mini-calendar.classnames";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import { cn } from "@/lib/cn";

type MiniCalendarProps = {
  className?: string;
};

function formatMonthCaption(date: Date): string {
  const raw = date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function MiniCalendar({ className }: MiniCalendarProps) {
  const [selected, setSelected] = useState<Date | undefined>(new Date());
  const [month, setMonth] = useState<Date>(new Date());

  return (
    <GlassPanel
      variant="subtle"
      intensity="low"
      elevation="floating"
      className={cn("w-full min-w-0 overflow-hidden rounded-[20px] p-3.5 sm:p-4", className)}
    >
      <div className="w-full min-w-0 overflow-hidden">
        <DayPicker
          mode="single"
          locale={ptBR}
          selected={selected}
          onSelect={setSelected}
          month={month}
          onMonthChange={setMonth}
          showOutsideDays
          fixedWeeks
          navLayout="around"
          classNames={miniCalendarClassNames}
          formatters={{
            formatCaption: formatMonthCaption,
            formatWeekdayName: (date) =>
              date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "").slice(0, 3),
          }}
        />
      </div>
    </GlassPanel>
  );
}
