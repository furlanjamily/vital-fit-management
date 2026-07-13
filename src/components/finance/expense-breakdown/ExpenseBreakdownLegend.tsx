import { cn } from "@/lib/cn";
import { glassText } from "@/config/glass-typography";
import type { ExpenseBreakdownItem } from "./types";

type ExpenseBreakdownLegendProps = {
  items: ExpenseBreakdownItem[];
  className?: string;
};

export function ExpenseBreakdownLegend({
  items,
  className,
}: ExpenseBreakdownLegendProps) {
  return (
    <ul
      className={cn(
        "flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-3 sm:gap-x-2 sm:gap-y-3.5",
        className,
      )}
    >
      {items.map((item) => {
        const isZero = item.value <= 0;

        return (
          <li
            key={item.id}
            className={cn(
              "flex shrink-0 items-center gap-2 transition-opacity",
              isZero && "opacity-45",
            )}
          >
            <span
              className="size-2 shrink-0 rounded-[2px]"
              style={{ backgroundColor: item.color }}
              aria-hidden
            />
            <span
              className={cn(
                "whitespace-nowrap text-[13px] leading-none sm:text-[14px]",
                glassText.secondary,
              )}
            >
              {item.name}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
