import type { TableColumnAlign } from "@/components/common/table/table.types";
import { cn } from "@/lib/cn";

export function getTableAlignClassName(align: TableColumnAlign = "left") {
  return {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[align];
}

export function getTableCellContentClassName(align: TableColumnAlign = "left") {
  return cn(
    "w-full min-w-0",
    align === "left" && "flex justify-start",
    align === "center" && "flex justify-center",
    align === "right" && "flex justify-end",
  );
}

/** Plain text cells — prevents overflow into adjacent columns. */
export function getTableTruncatedTextClassName() {
  return "block min-w-0 max-w-full truncate";
}

export function getTableEdgeCellClassName(
  index: number,
  total: number,
  align: TableColumnAlign = "left",
) {
  if (index === total - 1) {
    return align === "right" ? "pl-1 pr-1" : "pl-5 pr-0";
  }

  if (index === 0) return "pl-0 pr-5";

  return "px-5";
}

export function getTableEdgeHeaderClassName(
  index: number,
  total: number,
  align: TableColumnAlign = "left",
) {
  return getTableEdgeCellClassName(index, total, align);
}
