"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Search } from "lucide-react";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import { GlobalFilters } from "@/components/common/table/GlobalFilters";
import type { TableFilterDefinition } from "@/components/common/table/global-filters.types";
import { TableColGroup } from "@/components/common/table/TableColGroup";
import { TableFooter } from "@/components/common/table/TableFooter";
import { TableHead } from "@/components/common/table/TableHead";
import type { TableColumn } from "@/components/common/table/table.types";
import { cn } from "@/lib/cn";

export type { TableColumn } from "@/components/common/table/table.types";
export type { TableFilterDefinition } from "@/components/common/table/global-filters.types";

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
const DEFAULT_EMPTY_MESSAGE = "Nenhum registro encontrado.";
const DEFAULT_SEARCH_PLACEHOLDER = "Search";

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
  rowClassName?: (row: T) => string | undefined;
  className?: string;
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
  rowClassName,
  className,
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

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

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

      <GlassPanel
        variant="subtle"
        intensity="low"
        elevation="floating"
        className="flex min-h-0 flex-1 flex-col rounded-2xl px-3 pt-3"
      >
        {title ? (
          <div className="mb-5 flex shrink-0 items-center justify-between gap-4">
            <p className="text-sm font-semibold text-white">{title}</p>
          </div>
        ) : null}

        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-x-auto",
            !fillsParent && "max-h-[min(480px,55vh)]",
          )}
        >
          <div className="shrink-0">
            <table className="w-full min-w-[640px] table-fixed border-separate border-spacing-0">
              <TableColGroup columns={columns} />
              <TableHead columns={columns} />
            </table>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <table className="w-full min-w-[640px] table-fixed border-separate border-spacing-0">
              <TableColGroup columns={columns} />
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
                  paginatedData.map((row) => (
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
                          className={cn(
                            "py-3.5 pr-4 text-xs text-white/55 last:pr-0",
                            column.className,
                          )}
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
