import { cn } from "@/lib/cn";
import { glassText } from "@/config/glass-typography";
import type { ExpenseBreakdownItem } from "./types";

const CHART_SIZE = 170;
const CENTER = CHART_SIZE / 2;
const RADIUS = 68;
const STROKE_WIDTH = 26;
const GAP_DEGREES = 2.5;
const INNER_RADIUS = RADIUS - STROKE_WIDTH / 2;
const INNER_DIAMETER_RATIO = (INNER_RADIUS * 2) / CHART_SIZE;

type ArcSegment = {
  color: string;
  dashLength: number;
  rotation: number;
};

function buildArcSegments(items: ExpenseBreakdownItem[]): ArcSegment[] {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const circumference = 2 * Math.PI * RADIUS;
  const totalGapDegrees = GAP_DEGREES * items.length;
  const availableDegrees = 360 - totalGapDegrees;

  let rotation = -90 + GAP_DEGREES / 2;

  return items.map((item) => {
    const segmentDegrees = (item.value / total) * availableDegrees;
    const dashLength = (segmentDegrees / 360) * circumference;
    const arc: ArcSegment = {
      color: item.color,
      dashLength,
      rotation,
    };

    rotation += segmentDegrees + GAP_DEGREES;
    return arc;
  });
}

function formatTotalAmount(total: number): string {
  return total.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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
  const segments = buildArcSegments(items);
  const circumference = 2 * Math.PI * RADIUS;

  return (
    <div
      className={cn(
        "@container relative aspect-square w-full max-w-[170px] shrink-0",
        className,
      )}
      role="img"
      aria-label={`Despesas totais ${formatTotalAmount(total)}`}
    >
      <svg
        viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}
        className="block size-full"
        aria-hidden
        preserveAspectRatio="xMidYMid meet"
      >
        {segments.map((segment, index) => (
          <circle
            key={`${segment.color}-${index}`}
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

      <div
        className="pointer-events-none absolute left-1/2 top-1/2 flex aspect-square -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center overflow-hidden rounded-full"
        style={{
          width: `${INNER_DIAMETER_RATIO * 100}%`,
          height: `${INNER_DIAMETER_RATIO * 100}%`,
        }}
      >
        <span className={cn("w-full px-0.5 text-center text-[clamp(9px,10.5cqw,16px)] font-bold leading-none tracking-[-0.03em]", glassText.primary)}>
          {formatTotalAmount(total)}
        </span>
        <span className={cn("mt-[0.35em] text-[clamp(8px,6.5cqw,12px)] leading-none", glassText.secondary)}>
          {totalLabel}
        </span>
      </div>
    </div>
  );
}
