"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, LogOut, User } from "lucide-react";
import { GhostButton } from "@/components/common/form";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import { UserAvatar } from "@/components/users/UserAvatar";
import { profileHref } from "@/config/app-nav.config";
import {
  resolveAvatarUrl,
  resolveDisplayName,
} from "@/lib/auth/resolve-user-display";
import { createClient } from "@/lib/supabase/client";
import { glassText } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

type SessionUser = {
  displayName: string;
  email: string;
  avatarUrl: string | null;
};

interface NavUserMenuProps {
  /** Só avatar no trigger; nome aparece no dropdown acima de "Meu perfil". */
  compact?: boolean;
}

export function NavUserMenu({ compact = false }: NavUserMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setSessionUser(null);
        setLoading(false);
        return;
      }

      const metadata = user.user_metadata ?? {};
      setSessionUser({
        displayName: resolveDisplayName(metadata, user.email ?? undefined),
        email: user.email ?? "",
        avatarUrl: resolveAvatarUrl(metadata),
      });
      setLoading(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  async function handleLogout() {
    setLoggingOut(true);
    setOpen(false);

    const supabase = createClient();
    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <GlassPanel
        variant="subtle"
        intensity="low"
        elevation="floating"
        className={cn("rounded-full", compact ? "size-10 shrink-0" : "h-11")}
      >
        <div className="h-full w-full animate-pulse rounded-full" />
      </GlassPanel>
    );
  }

  if (!sessionUser) return null;

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col-reverse gap-2 ",
        compact && "relative",
      )}
    >
      <GlassPanel
        variant="default"
        intensity="medium"
        elevation="floating"
        className="rounded-full"
      >
        {compact ? (
          <GhostButton
            iconOnly
            size="md"
            onClick={() => setOpen((current) => !current)}
            aria-expanded={open}
            aria-haspopup="menu"
            aria-label={sessionUser.displayName}
            className="size-10 shrink-0 hover:bg-white/6"
          >
            <UserAvatar
              name={sessionUser.displayName}
              avatarUrl={sessionUser.avatarUrl}
              className="size-9"
              textClassName="text-[10px]"
            />
          </GhostButton>
        ) : (
          <GhostButton
            fullWidth
            size="sm"
            onClick={() => setOpen((current) => !current)}
            aria-expanded={open}
            aria-haspopup="menu"
            className="justify-start text-left hover:bg-white/6"
            leftIcon={
              <UserAvatar
                name={sessionUser.displayName}
                avatarUrl={sessionUser.avatarUrl}
                className="size-9"
                textClassName="text-[10px]"
              />
            }
            rightIcon={
              open ? (
                <ChevronUp className="size-3.5 transition-transform duration-200" />
              ) : (
                <ChevronDown className="size-3.5 transition-transform duration-200" />
              )
            }
          >
            <span
              className={cn(
                "min-w-0 flex-1 truncate text-sm font-semibold tracking-[-0.02em]",
                glassText.primary,
              )}
            >
              {sessionUser.displayName}
            </span>
          </GhostButton>
        )}
      </GlassPanel>

      {open && (
        <GlassPanel
          variant="strong"
          intensity="high"
          elevation="solid"
          className={cn(
            "rounded-2xl p-1.5",
            compact && "absolute bottom-full right-0 z-50 mb-2 w-56",
          )}
        >
          {compact ? (
            <div className="px-3 py-2">
              <p
                className={cn(
                  "truncate text-sm font-semibold tracking-[-0.02em]",
                  glassText.primary,
                )}
              >
                {sessionUser.displayName}
              </p>
              {sessionUser.email ? (
                <p className={cn("truncate text-[11px]", glassText.muted)}>
                  {sessionUser.email}
                </p>
              ) : null}
            </div>
          ) : null}

          <GhostButton
            transparent
            href={profileHref}
            fullWidth
            size="sm"
            leftIcon={<User className="size-3.5" />}
            onClick={() => setOpen(false)}
            className={cn("justify-start text-left", glassText.primaryElevated)}
          >
            Meu perfil
          </GhostButton>

          <GhostButton
            transparent
            fullWidth
            size="sm"
            onClick={handleLogout}
            disabled={loggingOut}
            isLoading={loggingOut}
            className="justify-start text-left text-red-500 hover:text-red-600"
            leftIcon={<LogOut className="size-3.5" />}
          >
            Sair
          </GhostButton>
        </GlassPanel>
      )}
    </div>
  );
}
