import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

export type ProductChartColor = "white" | "green" | "orange";

export type ProductChartCapsule = {
  value: number;
  color: ProductChartColor;
};

export type ProductChartColumn = {
  top: ProductChartCapsule;
  mid: ProductChartColor;
  bottom: ProductChartCapsule;
};

type ProductChartCardProps = {
  columns?: ProductChartColumn[];
  title?: string;
  onMenuClick?: () => void;
  className?: string;
};

const PRODUCT_GLASS = {
  variant: "subtle" as const,
  intensity: "low" as const,
  elevation: "floating" as const,
};

const COLOR_MAP: Record<ProductChartColor, string> = {
  white: "#FFFFFF",
  green: "#FFB300",
  orange: "#FF7A00",
};

const LEGEND_ITEMS: { color: ProductChartColor; label: string }[] = [
  { color: "white", label: "Resources" },
  { color: "green", label: "Valid" },
  { color: "orange", label: "Invalid" },
];

const MOCK_COLUMNS: ProductChartColumn[] = [
  { top: { value: 52, color: "white" }, mid: "green", bottom: { value: 81, color: "orange" } },
  { top: { value: 96, color: "green" }, mid: "white", bottom: { value: 25, color: "orange" } },
  { top: { value: 48, color: "green" }, mid: "orange", bottom: { value: 51, color: "white" } },
  { top: { value: 80, color: "green" }, mid: "white", bottom: { value: 49, color: "orange" } },
  { top: { value: 34, color: "orange" }, mid: "white", bottom: { value: 67, color: "green" } },
  { top: { value: 92, color: "green" }, mid: "orange", bottom: { value: 28, color: "white" } },
  { top: { value: 58, color: "green" }, mid: "white", bottom: { value: 20, color: "orange" } },
  { top: { value: 84, color: "orange" }, mid: "white", bottom: { value: 39, color: "green" } },
  { top: { value: 36, color: "white" }, mid: "green", bottom: { value: 72, color: "orange" } },
];

const CAPSULE_MIN_H = 28;
const CAPSULE_MAX_H = 96;
const CAPSULE_SCALE = 0.95;

function capsuleHeight(value: number): number {
  return Math.min(CAPSULE_MAX_H, Math.max(CAPSULE_MIN_H, value * CAPSULE_SCALE));
}

function sumCapsuleValues(columns: ProductChartColumn[]): number {
  return columns.reduce(
    (sum, col) => sum + col.top.value + col.bottom.value,
    0,
  );
}

function formatTotal(value: number): string {
  return value.toLocaleString("en-US");
}

type CapsuleProps = {
  value: number;
  color: ProductChartColor;
};

function Capsule({ value, color }: CapsuleProps) {
  return (
    <div
      className="flex w-full items-center justify-center rounded-full transition-[filter] duration-200 hover:brightness-110"
      style={{
        backgroundColor: COLOR_MAP[color],
        height: capsuleHeight(value),
      }}
    >
      <span className={cn("text-[12px] font-bold leading-none", color === "white" ? "text-gray-600" : glassText.primary)}>{value}</span>
    </div>
  );
}

type ChartColumnProps = {
  column: ProductChartColumn;
};

function ChartColumn({ column }: ChartColumnProps) {
  return (
    <div className="relative flex h-full w-8 shrink-0 flex-col items-center justify-center sm:w-9">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/10"
      />
      <div className="relative z-10 flex w-full flex-col items-center gap-2">
        <Capsule value={column.top.value} color={column.top.color} />
        <span
          className="block size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: COLOR_MAP[column.mid] }}
        />
        <Capsule value={column.bottom.value} color={column.bottom.color} />
      </div>
    </div>
  );
}

type LegendRadioProps = {
  color: ProductChartColor;
};

function LegendRadio({ color }: LegendRadioProps) {
  return (
    <span
      className="relative flex size-3.5 shrink-0 items-center justify-center rounded-full border-[1.5px]"
      style={{ borderColor: COLOR_MAP[color] }}
    >
      <span className="block size-1.5 rounded-full bg-white/50" />
    </span>
  );
}

export function ProductChartCard({
  columns = MOCK_COLUMNS,
  title = "PRODUCT",
  onMenuClick,
  className,
}: ProductChartCardProps) {
  const total = sumCapsuleValues(columns);

  return (
    <GlassPanel {...PRODUCT_GLASS} className={cn("w-full h-full rounded-[20px]", className)}>
      <div className="flex h-full flex-col gap-6 px-6 py-6 sm:gap-7 sm:px-8 sm:py-7">
        <div className="flex items-center justify-between">
          <h2
            className={cn(
              glassTextStyles.tableHeader,
              "text-[14px] font-bold tracking-[0.14em] sm:text-[15px]",
            )}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Product chart menu"
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-full transition hover:bg-white/5 hover:text-glass-secondary",
              glassText.tertiary,
            )}
          >
            <span className="text-[18px] leading-none tracking-[0.12em]">⋯</span>
          </button>
        </div>

        <div className="-mx-1 overflow-x-auto px-1 [scrollbar-width:thin] h-full">
          <div className="flex h-full min-w-[320px] items-stretch justify-between gap-1 sm:min-w-0 sm:gap-2">
            {columns.map((column, index) => (
              <ChartColumn key={index} column={column} />
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {LEGEND_ITEMS.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <LegendRadio color={item.color} />
                <span className={cn("text-[13px] font-medium tracking-[-0.01em]", glassText.secondary)}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className={cn("text-[13px] font-medium", glassText.muted)}>Total:</span>
            <span className={cn(glassText.primary, "text-[14px] font-bold tracking-[-0.02em]")}>
              {formatTotal(total)}
            </span>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
