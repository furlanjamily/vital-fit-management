"use client";

import { useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { GhostButton } from "@/components/common/button/GhostButton";
import { GlassButton } from "@/components/common/button/GlassButton";
import { DatePicker } from "@/components/common/date-picker/DatePicker";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import { GlassInput } from "@/components/common/input/GlassInput";
import { GlassSelect } from "@/components/common/select/GlassSelect";
import type { TableFilterDefinition } from "@/components/common/table/global-filters.types";
import { glassText } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

export type GlobalFiltersProps<T> = {
  filters: TableFilterDefinition<T>[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onClear: () => void;
  className?: string;
  defaultExpanded?: boolean;
};

function countActiveFilters(values: Record<string, string>) {
  return Object.values(values).filter((value) => value.trim().length > 0).length;
}

type FilterControlProps<T> = {
  filter: TableFilterDefinition<T>;
  value: string;
  onChange: (key: string, value: string) => void;
};

function FilterControl<T>({ filter, value, onChange }: FilterControlProps<T>) {
  if (filter.type === "text") {
    return (
      <GlassInput
        leftIcon={filter.leftIcon ?? Search}
        inputSize="md"
        tone="muted"
        value={value}
        onChange={(event) => onChange(filter.key, event.target.value)}
        placeholder={filter.placeholder}
        wrapperClassName={cn("w-full sm:w-52", filter.wrapperClassName)}
      />
    );
  }

  if (filter.type === "select") {
    return (
      <GlassSelect
        selectSize="md"
        tone="muted"
        value={value}
        onChange={(event) => onChange(filter.key, event.target.value)}
        placeholder={filter.placeholder}
        options={filter.options}
        wrapperClassName={cn("w-full sm:w-44", filter.wrapperClassName)}
      />
    );
  }

  return (
    <DatePicker
      value={value}
      onChange={(nextValue) => onChange(filter.key, nextValue)}
      placeholder={filter.placeholder}
      wrapperClassName={cn("w-full sm:w-44", filter.wrapperClassName)}
    />
  );
}

export function GlobalFilters<T>({
  filters,
  values,
  onChange,
  onClear,
  className,
  defaultExpanded = false,
}: GlobalFiltersProps<T>) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const activeCount = countActiveFilters(values);
  const canClear = activeCount > 0;

  return (
    <GlassPanel
      intensity="low"
      elevation="floating"
      className={cn("rounded-xl p-3", className)}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <p className={cn("shrink-0 text-sm font-medium", glassText.secondary)}>Filtrar por</p>

          {!expanded && activeCount > 0 ? (
            <span className={cn("inline-flex min-w-5 items-center justify-center rounded-full bg-white/12 px-1.5 py-0.5 text-[10px] font-semibold", glassText.primary)}>
              {activeCount}
            </span>
          ) : null}

          <ChevronDown
            aria-hidden
            className={cn(
              "ml-auto size-4 shrink-0 transition-transform duration-200",
              glassText.tertiary,
              expanded && "rotate-180",
            )}
          />
        </button>

        {!expanded && canClear ? (
          <GhostButton
            onClick={onClear}
            className="shrink-0 gap-1.5 px-2 py-1.5 text-[11px] font-medium"
          >
            <X className="size-3" />
            Limpar
          </GhostButton>
        ) : null}
      </div>

      {expanded ? (
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-wrap items-center justify-center gap-3">
            {filters.map((filter) => (
              <FilterControl
                key={filter.key}
                filter={filter}
                value={values[filter.key] ?? ""}
                onChange={onChange}
              />
            ))}
          </div>

          <GlassButton
            variant="subtle"
            size="sm"
            onClick={onClear}
            rightIcon={<X className="size-1.5" />}
            className="shrink-0 gap-1.5 self-end text-xs font-medium lg:self-auto"
          >
            Limpar filtros
          </GlassButton>
        </div>
      ) : null}
    </GlassPanel>
  );
}
