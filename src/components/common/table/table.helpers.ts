import type { TableColumn, TableColumnAlign } from "@/components/common/table/table.types";
import { cn } from "@/lib/cn";

/** Largura mínima de coluna sem minWidth/width em px — evita compressão no mobile. */
export const DEFAULT_COLUMN_MIN_WIDTH_PX = 120;

function parseCssLengthToPx(value: string): number | undefined {
  const trimmed = value.trim();
  const amount = Number.parseFloat(trimmed);
  if (!Number.isFinite(amount)) return undefined;
  if (trimmed.endsWith("rem")) return amount * 16;
  if (trimmed.endsWith("px")) return amount;
  return undefined;
}

/** Largura efetiva da coluna em px (ignora % para não comprimir no mobile). */
export function getColumnMinWidthPx<T>(column: TableColumn<T>): number {
  const fromMin = column.minWidth ? parseCssLengthToPx(column.minWidth) : undefined;
  const fromWidth = column.width ? parseCssLengthToPx(column.width) : undefined;
  return fromMin ?? fromWidth ?? DEFAULT_COLUMN_MIN_WIDTH_PX;
}

/** Soma das larguras mínimas — tabela nunca fica menor que isso (scroll horizontal). */
export function getTableMinWidthPx<T>(columns: TableColumn<T>[]): number {
  return columns.reduce((total, column) => total + getColumnMinWidthPx(column), 0);
}

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

/**
 * Classes para fixar uma coluna (ex.: "Ações") durante o scroll horizontal
 * em mobile. O fundo é necessário para que o conteúdo que passa por baixo
 * não vaze visualmente através da coluna fixa; a sombra reforça a separação.
 */
export function getTableStickyClassName(sticky?: "left" | "right") {
  if (!sticky) return undefined;

  return cn(
    "sticky z-10 bg-[#1c130a]/85 backdrop-blur-md",
    sticky === "left" && "left-0 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.35)]",
    sticky === "right" && "right-0 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.35)]",
  );
}
