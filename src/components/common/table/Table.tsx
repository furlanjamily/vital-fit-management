"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Search } from "lucide-react";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import { GlobalFilters } from "@/components/common/table/GlobalFilters";
import type { TableFilterDefinition } from "@/components/common/table/global-filters.types";
import { TableColGroup } from "@/components/common/table/TableColGroup";
import { TableFooter } from "@/components/common/table/TableFooter";
import { TableHead } from "@/components/common/table/TableHead";
import type { TableColumn } from "@/components/common/table/table.types";
import {
  getTableAlignClassName,
  getTableCellContentClassName,
  getTableEdgeCellClassName,
} from "@/components/common/table/table.helpers";
import { glassTextStyles } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

export type { TableColumn } from "@/components/common/table/table.types";
export type { TableFilterDefinition } from "@/components/common/table/global-filters.types";

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
const DEFAULT_EMPTY_MESSAGE = "Nenhum registro encontrado.";
const DEFAULT_SEARCH_PLACEHOLDER = "Search";

type TableGroupBy<T> = {
  key: (row: T) => string;
  renderHeader: (groupKey: string) => ReactNode;
};

type TableProps<T> = {
  data: T[];
  columns: TableColumn<T>[];
  getRowId: (row: T) => string;
  title?: string;
  /** Definições dos filtros exibidos no cabeçalho. Omitido: busca textual padrão. */
  filters?: TableFilterDefinition<T>[];
  /** Valores dos filtros controlados externamente. */
  filterValues?: Record<string, string>;
  onFilterChange?: (values: Record<string, string>) => void;
  /** Placeholder da busca textual padrão, usada quando `filters` é omitido. */
  searchPlaceholder?: string;
  emptyMessage?: string;
  /** Conteúdo extra alinhado à direita do cabeçalho (botões, dropdowns de ordenação, etc). */
  headerActions?: ReactNode;
  /** Conteúdo renderizado entre os filtros e a tabela (ex.: AgendaDateFilter). */
  filterAccessory?: ReactNode;
  /** Agrupa linhas com cabeçalho de seção (ex.: por dia na agenda). */
  groupBy?: TableGroupBy<T>;
  rowClassName?: (row: T) => string | undefined;
  className?: string;
  /** Classes extras no GlassPanel que envolve a tabela (ex.: padding horizontal). */
  panelClassName?: string;
  defaultPageSize?: number;
  /** Opções exibidas no seletor de itens por página. */
  pageSizeOptions?: number[];
};

function createDefaultFilters<T>(searchPlaceholder: string): TableFilterDefinition<T>[] {
  return [
    {
      type: "text",
      key: "search",
      placeholder: searchPlaceholder,
      leftIcon: Search,
    },
  ];
}

function createInitialFilterValues<T>(filters: TableFilterDefinition<T>[]) {
  return Object.fromEntries(filters.map((filter) => [filter.key, ""]));
}

function matchesTextFilter<T>(row: T, columns: TableColumn<T>[], query: string) {
  const searchableColumns = columns.filter((column) => column.searchValue);
  return searchableColumns.some((column) =>
    column.searchValue!(row).toLowerCase().includes(query.toLowerCase()),
  );
}

function applyTableFilters<T>(
  data: T[],
  columns: TableColumn<T>[],
  filters: TableFilterDefinition<T>[],
  values: Record<string, string>,
) {
  const activeFilters = filters.filter((filter) => values[filter.key]?.trim());

  if (activeFilters.length === 0) return data;

  return data.filter((row) =>
    activeFilters.every((filter) => {
      const rawValue = values[filter.key]?.trim() ?? "";

      if (filter.type === "text") return matchesTextFilter(row, columns, rawValue);

      return filter.match(row) === rawValue;
    }),
  );
}

export function Table<T>({
  data,
  columns,
  getRowId,
  title,
  filters,
  filterValues,
  onFilterChange,
  searchPlaceholder = DEFAULT_SEARCH_PLACEHOLDER,
  emptyMessage = DEFAULT_EMPTY_MESSAGE,
  headerActions,
  filterAccessory,
  groupBy,
  rowClassName,
  className,
  panelClassName,
  defaultPageSize = DEFAULT_PAGE_SIZE,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}: TableProps<T>) {
  const resolvedFilters = filters ?? createDefaultFilters<T>(searchPlaceholder);
  const [internalFilterValues, setInternalFilterValues] = useState(() =>
    createInitialFilterValues(resolvedFilters),
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const activeFilterValues = filterValues ?? internalFilterValues;

  const fillsParent = Boolean(className?.includes("h-full") || className?.includes("flex-1"));

  const resolvedPageSizeOptions = useMemo(() => {
    const options = [...new Set([...pageSizeOptions, defaultPageSize, pageSize])].sort(
      (a, b) => a - b,
    );
    return options.filter((option) => option > 0);
  }, [pageSizeOptions, defaultPageSize, pageSize]);

  const filteredData = useMemo(
    () => applyTableFilters(data, columns, resolvedFilters, activeFilterValues),
    [data, columns, resolvedFilters, activeFilterValues],
  );

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  useEffect(() => {
    setPage(1);
  }, [data.length]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const tableBodyRows = useMemo(() => {
    if (!groupBy) {
      return paginatedData.map((row) => ({ type: "row" as const, row }));
    }

    const items: Array<{ type: "header"; groupKey: string } | { type: "row"; row: T }> = [];
    let lastGroupKey: string | null = null;

    for (const row of paginatedData) {
      const groupKey = groupBy.key(row);
      if (groupKey !== lastGroupKey) {
        items.push({ type: "header", groupKey });
        lastGroupKey = groupKey;
      }
      items.push({ type: "row", row });
    }

    return items;
  }, [groupBy, paginatedData]);

  const rangeStart = filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, filteredData.length);
  const showPageControls = totalPages > 1;

  function goToPage(nextPage: number) {
    setPage(Math.min(Math.max(1, nextPage), totalPages));
  }

  function updateFilterValues(nextValues: Record<string, string>) {
    if (onFilterChange) {
      onFilterChange(nextValues);
    } else {
      setInternalFilterValues(nextValues);
    }

    setPage(1);
  }

  function handleFilterValueChange(key: string, value: string) {
    updateFilterValues({ ...activeFilterValues, [key]: value });
  }

  function handleClearFilters() {
    updateFilterValues(createInitialFilterValues(resolvedFilters));
  }

  function handlePageSizeChange(nextPageSize: number) {
    if (!Number.isFinite(nextPageSize) || nextPageSize <= 0) return;

    setPageSize(nextPageSize);
    setPage(1);
  }

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col gap-4",
        fillsParent && "h-full flex-1",
        className,
      )}
    >
      <div className="flex shrink-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <GlobalFilters
          filters={resolvedFilters}
          values={activeFilterValues}
          onChange={handleFilterValueChange}
          onClear={handleClearFilters}
          className="flex-1"
        />
        {headerActions ? (
          <div className="flex shrink-0 items-center gap-3 self-end lg:self-auto">
            {headerActions}
          </div>
        ) : null}
      </div>

      {filterAccessory ? <div className="shrink-0">{filterAccessory}</div> : null}

      <GlassPanel
        variant="subtle"
        intensity="low"
        elevation="floating"
        className={cn(
          "flex min-h-0 flex-1 flex-col rounded-2xl px-4 pt-3 sm:px-5",
          panelClassName,
        )}
      >
        {title ? (
          <div className="mb-5 flex shrink-0 items-center justify-between gap-4">
            <p className={glassTextStyles.panelTitle}>{title}</p>
          </div>
        ) : null}

        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-x-auto",
            !fillsParent && "max-h-[min(480px,55vh)]",
          )}
        >
          <div className="shrink-0">
            <table className="w-full table-fixed border-separate border-spacing-0">
              <TableColGroup columns={columns} />
              <TableHead columns={columns} />
            </table>
          </div>

          <div
            className={cn(
              "min-h-0 flex-1 overflow-x-auto",
              fillsParent
                ? "flex flex-col overflow-y-auto scrollbar-none"
                : "overflow-y-auto scrollbar-none",
            )}
          >
            {filteredData.length === 0 ? (
              <div
                className={cn(
                  "flex items-center justify-center px-4 py-10 text-center",
                  fillsParent && "flex-1",
                  glassTextStyles.tableEmpty,
                )}
              >
                {emptyMessage}
              </div>
            ) : (
              <table className="w-full table-fixed border-separate border-spacing-0">
                <TableColGroup columns={columns} />
                <tbody>
                  {tableBodyRows.map((item) =>
                    item.type === "header" ? (
                      <tr key={`group-${item.groupKey}`}>
                        <td colSpan={columns.length} className="px-0 pb-2 pt-3">
                          <div className="border-l-2 border-orange-500/70 bg-transparent px-3 py-2">
                            <span
                              className={cn(
                                "block text-xs font-semibold capitalize tracking-wide",
                                glassTextStyles.tableHeader,
                              )}
                            >
                              {groupBy!.renderHeader(item.groupKey)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr
                        key={getRowId(item.row)}
                        className={cn(
                          "border-b rounded-xl border-white/6 transition hover:bg-white/4",
                          rowClassName?.(item.row),
                        )}
                      >
                        {columns.map((column, columnIndex) => (
                          <td
                            key={column.key}
                            className={cn(
                              "py-3.5",
                              getTableEdgeCellClassName(columnIndex, columns.length, column.align),
                              getTableAlignClassName(column.align),
                              glassTextStyles.tableCell,
                              column.className,
                            )}
                          >
                            <div className={getTableCellContentClassName(column.align)}>
                              {column.render(item.row)}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <TableFooter
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          totalItems={filteredData.length}
          pageSize={pageSize}
          pageSizeOptions={resolvedPageSizeOptions}
          currentPage={currentPage}
          totalPages={totalPages}
          showPageControls={showPageControls}
          onPageChange={goToPage}
          onPageSizeChange={handlePageSizeChange}
        />
      </GlassPanel>
    </div>
  );
}
