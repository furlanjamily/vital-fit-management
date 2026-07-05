import type { AnchorHTMLAttributes } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";

type PremiumButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: "primary" | "secondary";
  showIcon?: boolean;
};

const variants = {
  primary:
    "border-white/10 bg-[#2777ff] text-white shadow-[0_18px_50px_rgba(39,119,255,0.34)] hover:bg-[#3f86ff] hover:shadow-[0_20px_68px_rgba(39,119,255,0.5)]",
  secondary:
    "border-white/[0.18] bg-white/[0.075] text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl hover:bg-white/[0.13] hover:text-white",
};

export function PremiumButton({
  className,
  children,
  variant = "primary",
  showIcon = true,
  ...props
}: PremiumButtonProps) {
  return (
    <a
      className={cn(
        "group inline-flex h-[3.25rem] items-center justify-center gap-2 rounded-full border px-6 text-sm font-semibold tracking-[-0.01em]",
        "transition-all duration-300 ease-out hover:-translate-y-0.5",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8ad5ff]",
        variants[variant],
        className,
      )}
      {...props}
    >
      <span>{children}</span>
      {showIcon ? (
        <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      ) : null}
    </a>
  );
}
