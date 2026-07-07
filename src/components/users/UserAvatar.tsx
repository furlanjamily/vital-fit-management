import { cn } from "@/lib/cn";
import { getAvatarColor, getInitials } from "@/components/users/user.helpers";

type UserAvatarProps = {
  name: string;
  avatarUrl: string | null;
  className?: string;
  textClassName?: string;
};

export function UserAvatar({ name, avatarUrl, className, textClassName }: UserAvatarProps) {
  if (avatarUrl) {
    return (
      <span
        className={cn(
          "block shrink-0 rounded-full border border-white/14 bg-cover bg-center",
          className,
        )}
        style={{ backgroundImage: `url(${avatarUrl})` }}
        role="img"
        aria-label={name}
      />
    );
  }

  const initials = getInitials(name);

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full border border-white/14 font-semibold text-white",
        className,
      )}
      style={{ backgroundColor: initials ? getAvatarColor(name) : "rgba(255,255,255,0.08)" }}
      aria-label={name || "Avatar"}
    >
      <span className={textClassName}>{initials || "?"}</span>
    </span>
  );
}
