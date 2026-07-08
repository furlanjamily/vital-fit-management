import type { LucideIcon } from "lucide-react";
import type { GlassSelectOption } from "@/components/common/select/glass-select";

export type TableTextFilter = {
  type: "text";
  key: string;
  placeholder?: string;
  leftIcon?: LucideIcon;
  wrapperClassName?: string;
};

export type TableSelectFilter<T> = {
  type: "select";
  key: string;
  placeholder?: string;
  options: GlassSelectOption[];
  wrapperClassName?: string;
  match: (row: T) => string;
};

export type TableDateFilter<T> = {
  type: "date";
  key: string;
  placeholder?: string;
  wrapperClassName?: string;
  match: (row: T) => string;
};

export type TableFilterDefinition<T> =
  | TableTextFilter
  | TableSelectFilter<T>
  | TableDateFilter<T>;
