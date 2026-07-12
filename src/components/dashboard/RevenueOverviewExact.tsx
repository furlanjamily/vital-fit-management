import type { CSSProperties, ReactNode } from "react";
import { ChevronDown, SquareArrowUp } from "lucide-react";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

type RevenueBar = {
  month: string;
  percentage: number;
  height: number;
  highlighted?: boolean;
};

const TOTAL_REVENUE = 13_852.64;
const HIGHLIGHT_VALUE = 3_256.32;
const CHART_MAX_HEIGHT = 132;

const REVENUE_BARS: RevenueBar[] = [
  { month: "Jan", percentage: 45, height: 45 },
  { month: "Feb", percentage: 52, height: 52 },
  { month: "Mar", percentage: 61, height: 61 },
  { month: "Apr", percentage: 32, height: 32 },
  { month: "May", percentage: 48, height: 48 },
  { month: "Jun", percentage: 78, height: 78 },
  { month: "Jul", percentage: 33, height: 33 },
  { month: "Aug", percentage: 77, height: 77 },
  { month: "Sep", percentage: 68, height: 68, highlighted: true },
  { month: "Oct", percentage: 48, height: 48 },
  { month: "Nov", percentage: 55, height: 55 },
  { month: "Dec", percentage: 42, height: 42 },
];

const HIGHLIGHTED_BAR_INDEX = REVENUE_BARS.findIndex((bar) => bar.highlighted);

const REVENUE_GLASS = {
  variant: "subtle" as const,
  intensity: "low" as const,
  elevation: "floating" as const,
};

type RevenueGlassProps = {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

function RevenueGlass({ className, style, children }: RevenueGlassProps) {
  return (
    <GlassPanel {...REVENUE_GLASS} className={className} style={style}>
      {children}
    </GlassPanel>
  );
}

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const BAR_HATCH_HEIGHT_PERCENT = 38;
const HIGHLIGHT_ACCENT = "#FF7A00";

const barHatchStyle: CSSProperties = {
  backgroundImage: `repeating-linear-gradient(
    -45deg,
    rgba(255, 255, 255, 0.14) 0px,
    rgba(255, 255, 255, 0.14) 1.5px,
    transparent 1.5px,
    transparent 5px
    
  )`,
};

type RevenueBarColumnProps = {
  bar: RevenueBar;
};

function RevenueBarColumn({ bar }: RevenueBarColumnProps) {
  const barHeightPx = Math.round((bar.height / 100) * CHART_MAX_HEIGHT);
  const hatchHeight = `${BAR_HATCH_HEIGHT_PERCENT}%`;

  return (
    <div
      className={cn(
        "relative flex flex-1 flex-col items-center justify-end",
        bar.highlighted && "z-30",
      )}
    >
      {bar.highlighted && (
        <RevenueGlass
          className="absolute z-40 size-[9px] rounded-full border-2"
          style={{ bottom: barHeightPx + 4, borderColor: HIGHLIGHT_ACCENT }}
        >
          <div className="grid h-full place-items-center">
            <span
              className="h-full size-[2px] rounded-full"
              style={{ backgroundColor: HIGHLIGHT_ACCENT }}
            />
          </div>
        </RevenueGlass>
      )}

      <RevenueGlass
        className="w-full max-w-[34px] min-w-[16px] rounded-full"
        style={{ height: barHeightPx }}
      >
        <div className="relative h-full w-full overflow-hidden rounded-full">
          <div className="absolute inset-0 bg-white/10" />

          {bar.highlighted ? (
            <>
              <div
                className="absolute inset-x-0 bottom-0 top-[28%] z-[1]"
                style={{ backgroundColor: HIGHLIGHT_ACCENT }}
              />
              <div
                className="absolute inset-x-0 top-0 z-[2] bg-white/15"
                style={{ height: hatchHeight, ...barHatchStyle }}
              />
            </>
          ) : (
            <>
              <div
                className="absolute inset-x-0 top-0 z-[1] bg-white/12"
                style={{ height: hatchHeight, ...barHatchStyle }}
              />
              <div
                className="absolute inset-x-0 bottom-0 z-[1] bg-orange-500"
                style={{ top: hatchHeight }}
              />
            </>
          )}

          <span
            className={cn(
              "absolute inset-x-0 bottom-[22%] z-[3] text-center text-[9px] font-medium leading-none tracking-[-0.02em]",
               glassText.tertiary,
            )}
          >
            {bar.percentage}%
          </span>                           
        </div>
      </RevenueGlass>

      <span className={cn("mt-1.5 text-[9px] font-medium tracking-[-0.01em]", glassText.muted)}>
        {bar.month}
      </span>
    </div>
  );
}

function HighlightConnector() {
  const badgeLeftPercent = 2;
  const lineStartPercent = 15;
  const highlightedCenterPercent =
    ((HIGHLIGHTED_BAR_INDEX + 0.5) / REVENUE_BARS.length) * 100;

  return (
    <div className="relative mb-3 h-7 w-full">
      <RevenueGlass
        className="absolute top-[200%] z-20 -translate-y-1/2 rounded-full"
        style={{ left: `${badgeLeftPercent}%` }}
      >
        <span
          className="block px-2.5 py-1 text-[12px] font-semibold tracking-[-0.03em]"
          style={{ color: HIGHLIGHT_ACCENT }}
        >
          ${formatCurrency(HIGHLIGHT_VALUE)}
        </span>
      </RevenueGlass>

      <div
        className="absolute top-[220%] z-0 h-px translate-y-[-250%] bg-white/40"
        style={{
          left: `${lineStartPercent}%`,
          width: `${highlightedCenterPercent - lineStartPercent}%`,
        }}
      />
    </div>
  );
}

export function RevenueOverviewExact() {
  return (
    <RevenueGlass className="w-full rounded-2xl px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h2 className={cn(glassText.primary, "text-base font-semibold tracking-[-0.04em]")}>
            Receitas Totais
          </h2>
          <p className={cn(glassText.muted, "mt-0.5 text-[11px] leading-snug")}>
            fique de olho nas receitas totais geradas
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 self-start">
          <RevenueGlass className="rounded-full">
            <button
              type="button"
              className={cn(
                "flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium transition-colors hover:bg-white/8",
                glassText.secondary,
              )}
            >
              Este ano
              <ChevronDown className={cn("size-3", glassText.tertiary)} strokeWidth={2.25} />
            </button>
          </RevenueGlass>

          <RevenueGlass className="size-7 rounded-full">
            <button
              type="button"
              aria-label="Export revenue"
              className={cn(
                "grid size-full place-items-center transition-colors hover:bg-white/8 hover:text-glass-primary",
                glassText.secondary,
              )}
            >
              <SquareArrowUp className="size-3" strokeWidth={2.25} />
            </button>
          </RevenueGlass>
        </div>
      </div>

      <div className="mt-4 flex items-end gap-3 sm:mt-5 sm:gap-4">
        <div className="mb-4 shrink-0 self-end">
          <RevenueGlass className="rounded-full">
            <div className="inline-flex items-baseline px-4 py-2 sm:px-5 sm:py-2.5">
              <span
                className={cn(
                  "mr-0.5 text-xl font-semibold tracking-tighter sm:text-2xl",
                  glassText.tertiary,
                )}
              >
                $
              </span>
              <span className={cn(glassTextStyles.kpiValue, "text-xl sm:text-2xl")}>
                {formatCurrency(TOTAL_REVENUE)}
              </span>
            </div>
          </RevenueGlass>
        </div>

        <div className="relative min-w-0 flex-1">
          <HighlightConnector />

          <div className="relative z-20 flex items-end gap-1 sm:gap-1.5">
            {REVENUE_BARS.map((bar) => (
              <RevenueBarColumn key={bar.month} bar={bar} />
            ))}
          </div>
        </div>
      </div>
    </RevenueGlass>
  );
}
