"use client";

import type { TableColumn } from "@/components/common/table/table.types";
import { getTableAlignClassName, getTableEdgeHeaderClassName } from "@/components/common/table/table.helpers";
import { glassTextStyles } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

type TableHeadProps<T> = {
  columns: TableColumn<T>[];
};

export function TableHead<T>({ columns }: TableHeadProps<T>) {
  return (
    <thead>
      <tr className="border-b border-white/10">
        {columns.map((column, index) => (
          <th
            key={column.key}
            className={cn(
              "pb-3 pt-1",
              getTableAlignClassName(column.align),
              getTableEdgeHeaderClassName(index, columns.length),
              glassTextStyles.tableHeader,
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
