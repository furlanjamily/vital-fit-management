"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { GhostButton, IconButton } from "@/components/common/form";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import { GlassSelect } from "@/components/common/select/GlassSelect";
import { cn } from "@/lib/cn";

export type TableFooterProps = {
  rangeStart: number;
  rangeEnd: number;
  totalItems: number;
  pageSize: number;
  pageSizeOptions: number[];
  currentPage: number;
  totalPages: number;
  showPageControls: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  className?: string;
};

type PaginationItem = number | "ellipsis";

function getPaginationItems(currentPage: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 2) {
    return [1, 2, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 1) {
    return [1, "ellipsis", totalPages - 1, totalPages];
  }

  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages];
}

export function TableFooter({
  totalItems,
  pageSize,
  pageSizeOptions,
  currentPage,
  totalPages,
  showPageControls,
  onPageChange,
  onPageSizeChange,
  className,
}: TableFooterProps) {
  const paginationItems = getPaginationItems(currentPage, totalPages);

  return (
    <div className={cn("flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between", className)}>
      <div className="flex items-center gap-2">
        <p className="text-[11px] text-white/40">Exibir</p>
        <GlassSelect
          selectSize="sm"
          tone="muted"
          value={String(pageSize)}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          aria-label="Itens por página"
          options={pageSizeOptions.map((option) => ({
            value: String(option),
            label: String(option),
          }))}
          wrapperClassName="inline-block"
          className="w-auto rounded-lg pr-7 text-white/75"
        />
        <p className="text-[11px] text-white/40">de {totalItems} resultados</p>
      </div>
      {showPageControls && (
        <nav
          aria-label="Paginação da tabela"
          className="flex items-center gap-1.5 self-end lg:self-auto"
        >
          <IconButton
            shape="square"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Página anterior"
            className="text-white/55 disabled:opacity-35"
          >
            <ChevronLeft className="size-3.5" />
          </IconButton>
          {paginationItems.map((item, index) =>
            item === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                aria-hidden
                className="px-1 text-xs font-medium tracking-widest text-white/35"
              >
                ...
              </span>
            ) : item === currentPage ? (
              <GlassPanel
                key={item}
                variant="subtle"
                intensity="low"
                elevation="floating"
                className="h-full w-full flex flex-col size-8 rounded-lg"
              >
                <span className="flex h-full text-xs font-semibold text-white justify-center items-center">{item}</span>
              </GlassPanel>
            ) : (
              <GhostButton
                key={item}
                onClick={() => onPageChange(item)}
                aria-label={`Ir para página ${item}`}
                className="size-8"
              >
                {item}
              </GhostButton>
            ),
          )}
          <IconButton
            shape="square"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Próxima página"
            className="text-white/55 disabled:opacity-35"
          >
            <ChevronRight className="size-3.5" />
          </IconButton>
        </nav>)}
    </div>
  );
}
