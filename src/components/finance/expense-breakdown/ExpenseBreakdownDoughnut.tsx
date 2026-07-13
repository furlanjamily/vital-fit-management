import { cn } from "@/lib/cn";
import { glassText } from "@/config/glass-typography";
import { formatBrlAmount } from "@/components/finance/finance.helpers";
import type { ExpenseBreakdownItem } from "./types";

const CHART_SIZE = 170;
const CENTER = CHART_SIZE / 2;
const RADIUS = 68;
const STROKE_WIDTH = 26;
const GAP_DEGREES = 2.5;
const INNER_RADIUS = RADIUS - STROKE_WIDTH / 2;
const INNER_DIAMETER_RATIO = (INNER_RADIUS * 2) / CHART_SIZE;

type ArcSegment = {
  id: string;
  color: string;
  dashLength: number;
  rotation: number;
};

function buildArcSegments(items: ExpenseBreakdownItem[]): ArcSegment[] {
  const activeItems = items.filter((item) => item.value > 0);
  const total = activeItems.reduce((sum, item) => sum + item.value, 0);
  if (total <= 0) return [];

  const circumference = 2 * Math.PI * RADIUS;
  const totalGapDegrees = GAP_DEGREES * activeItems.length;
  const availableDegrees = 360 - totalGapDegrees;

  let rotation = -90 + GAP_DEGREES / 2;

  return activeItems.map((item) => {
    const segmentDegrees = (item.value / total) * availableDegrees;
    const dashLength = (segmentDegrees / 360) * circumference;
    const arc: ArcSegment = {
      id: item.id,
      color: item.color,
      dashLength,
      rotation,
    };

    rotation += segmentDegrees + GAP_DEGREES;
    return arc;
  });
}

type ExpenseBreakdownDoughnutProps = {
  items: ExpenseBreakdownItem[];
  totalLabel: string;
  className?: string;
};

export function ExpenseBreakdownDoughnut({
  items,
  totalLabel,
  className,
}: ExpenseBreakdownDoughnutProps) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const isEmpty = total <= 0;
  const segments = isEmpty ? [] : buildArcSegments(items);
  const circumference = 2 * Math.PI * RADIUS;

  return (
    <div
      className={cn(
        "@container relative aspect-square w-full max-w-[170px] shrink-0",
        className,
      )}
      role="img"
      aria-label={
        isEmpty
          ? "Nenhuma despesa registrada no período"
          : `Despesas totais R$ ${formatBrlAmount(total)}`
      }
    >
      {!isEmpty ? (
        <svg
          viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}
          className="block size-full"
          aria-hidden
          preserveAspectRatio="xMidYMid meet"
        >
          {segments.map((segment) => (
            <circle
              key={segment.id}
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke={segment.color}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="butt"
              strokeDasharray={`${segment.dashLength} ${circumference - segment.dashLength}`}
              transform={`rotate(${segment.rotation} ${CENTER} ${CENTER})`}
            />
          ))}
        </svg>
      ) : (
        <div
          className="absolute inset-0 rounded-full border border-white/10 bg-white/[0.03]"
          aria-hidden
        />
      )}

      <div
        className="pointer-events-none absolute left-1/2 top-1/2 flex aspect-square -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center overflow-hidden rounded-full px-2"
        style={{
          width: `${INNER_DIAMETER_RATIO * 100}%`,
          height: `${INNER_DIAMETER_RATIO * 100}%`,
        }}
      >
        {isEmpty ? (
          <span
            className={cn(
              "text-center text-[clamp(9px,8cqw,13px)] leading-snug",
              glassText.muted,
            )}
          >
            Sem despesas no período
          </span>
        ) : (
          <>
            <span
              className={cn(
                "w-full px-0.5 text-center text-[clamp(9px,10.5cqw,16px)] font-bold leading-none tracking-[-0.03em]",
                glassText.primary,
              )}
            >
              R$ {formatBrlAmount(total)}
            </span>
            <span
              className={cn("mt-[0.35em] text-[clamp(8px,6.5cqw,12px)] leading-none", glassText.secondary)}
            >
              {totalLabel}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
