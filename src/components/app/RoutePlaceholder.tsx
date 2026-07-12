import { glassText } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

type RoutePlaceholderProps = {
  title: string;
};

export function RoutePlaceholder({ title }: RoutePlaceholderProps) {
  return (
    <div className="flex min-h-full items-center justify-center">
      <h1 className={cn("text-2xl font-semibold", glassText.primary)}>{title}</h1>
    </div>
  );
}
