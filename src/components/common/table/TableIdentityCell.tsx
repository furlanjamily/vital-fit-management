import { UserAvatar } from "@/components/users/UserAvatar";
import { glassTextStyles } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

type TableIdentityCellProps = {
  name: string;
  subtitle: string;
  avatarUrl?: string | null;
  className?: string;
};

export function TableIdentityCell({
  name,
  subtitle,
  avatarUrl = null,
  className,
}: TableIdentityCellProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <UserAvatar
        name={name}
        avatarUrl={avatarUrl}
        className="size-8 shrink-0"
        textClassName="text-[10px]"
      />
      <div className="min-w-0 flex-1 overflow-hidden">
        <p className={glassTextStyles.entityName} title={name}>
          {name}
        </p>
        <p className={glassTextStyles.entityEmail} title={subtitle}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}
