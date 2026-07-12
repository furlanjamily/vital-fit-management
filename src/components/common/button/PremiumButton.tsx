import type { AnchorHTMLAttributes } from "react";
import { ArrowUpRight } from "lucide-react";
import { glassText } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

type PremiumButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: "primary" | "secondary";
  showIcon?: boolean;
};

const variants = {
  primary: cn(
    "border-white/10 bg-gradient-to-r from-orange-500 to-orange-600 shadow-[0_18px_50px_rgba(249,115,22,0.34)] hover:from-orange-400 hover:to-orange-500 hover:shadow-[0_20px_68px_rgba(255,122,0,0.45)]",
    glassText.primary,
  ),
  secondary: cn(
    "border-white/[0.18] bg-white/[0.075] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl hover:bg-white/[0.13] hover:text-glass-primary",
    glassText.secondary,
  ),
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
