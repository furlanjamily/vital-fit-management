"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Search } from "lucide-react";
import { GlassPanel } from "@/components/common/glass-panel/glass-panel";
import { cn } from "@/lib/cn";

export type TableColumn<T> = {
  /** Identificador único da coluna. */
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  /** Valor textual usado pelo filtro global. Colunas sem searchValue não participam da busca. */
  searchValue?: (row: T) => string;
  className?: string;
  headerClassName?: string;
};

type ReusableTableProps<T> = {
  data: T[];
  columns: TableColumn<T>[];
  getRowId: (row: T) => string;
  title?: string;
  /** Filtro global controlado externamente. Quando omitido, a tabela exibe o input interno de busca. */
  globalFilter?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  /** Conteúdo extra alinhado à direita do cabeçalho (botões, dropdowns de ordenação, etc). */
  headerActions?: ReactNode;
  rowClassName?: (row: T) => string | undefined;
  className?: string;
};

export function ReusableTable<T>({
  data,
  columns,
  getRowId,
  title,
  globalFilter,
  searchPlaceholder = "Search",
  emptyMessage = "Nenhum registro encontrado.",
  headerActions,
  rowClassName,
  className,
}: ReusableTableProps<T>) {
  const [internalFilter, setInternalFilter] = useState("");
  const isControlled = globalFilter !== undefined;
  const activeFilter = (isControlled ? globalFilter : internalFilter).trim().toLowerCase();

  const filteredData = useMemo(() => {
    if (!activeFilter) return data;

    const searchableColumns = columns.filter((column) => column.searchValue);

    return data.filter((row) =>
      searchableColumns.some((column) =>
        column.searchValue!(row).toLowerCase().includes(activeFilter),
      ),
    );
  }, [data, columns, activeFilter]);

  return (
    <GlassPanel
      variant="subtle"
      intensity="low"
      elevation="floating"
      className={cn("rounded-2xl p-5", className)}
    >
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {title ? <p className="text-sm font-semibold text-white">{title}</p> : <span />}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {!isControlled && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-white/35" />
              <input
                type="text"
                value={internalFilter}
                onChange={(event) => setInternalFilter(event.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-xl border border-white/14 bg-black/20 py-2.5 pl-9 pr-4 text-xs text-white placeholder:text-white/35 outline-none transition focus:border-white/28 sm:w-44"
              />
            </div>
          )}
          {headerActions}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="border-b border-white/10">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "pb-3 pr-4 text-left text-[9px] font-semibold uppercase tracking-[0.08em] text-white/35 last:pr-0",
                    column.headerClassName,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-10 text-center text-xs text-white/40"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              filteredData.map((row) => (
                <tr
                  key={getRowId(row)}
                  className={cn(
                    "border-b border-white/6 transition hover:bg-white/4",
                    rowClassName?.(row),
                  )}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn("py-3.5 pr-4 text-xs text-white/55 last:pr-0", column.className)}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </GlassPanel>
  );
}
