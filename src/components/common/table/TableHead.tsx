"use client";

import type { TableColumn } from "@/components/common/table/table.types";
import { cn } from "@/lib/cn";

type TableHeadProps<T> = {
  columns: TableColumn<T>[];
};

export function TableHead<T>({ columns }: TableHeadProps<T>) {
  return (
    <thead>
      <tr className="border-b border-white/10">
        {columns.map((column) => (
          <th
            key={column.key}
            className={cn(
              "pb-3 pr-4 pt-1 text-left text-[9px] font-semibold uppercase tracking-[0.08em] text-white/35 last:pr-0",
              column.headerClassName,
            )}
          >
            {column.header}
          </th>
        ))}
      </tr>
    </thead>
  );
}
