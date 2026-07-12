"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2, LogOut, User } from "lucide-react";
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

export function NavUserMenu() {
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
        className="h-11 rounded-full"
      >
        <div className="h-full w-full animate-pulse rounded-full" />
      </GlassPanel>
    );
  }

  if (!sessionUser) return null;

  return (
    <div ref={containerRef} className="flex flex-col-reverse gap-2">
      {/* Vidro 1 — pill sobre a sidebar */}
      <GlassPanel
        variant="default"
        intensity="medium"
        elevation="floating"
        className="rounded-full"
      >
        <GhostButton
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-haspopup="menu"
          className="w-full justify-start gap-2.5 rounded-full px-2 py-1.5 text-left hover:bg-white/6"
        >
          <UserAvatar
            name={sessionUser.displayName}
            avatarUrl={sessionUser.avatarUrl}
            className="size-9"
            textClassName="text-[10px]"
          />

          <span className={cn("min-w-0 flex-1 truncate text-sm font-semibold tracking-[-0.02em]", glassText.primary)}>
            {sessionUser.displayName}
          </span>

          <span
            className={cn(
              "grid size-7 shrink-0 place-items-center rounded-full border border-white/14 bg-white/8 transition",
              glassText.secondary,
              open && cn("bg-white/14", glassText.primary),
            )}
          >
            <ChevronDown
              className={cn("size-3.5 transition-transform duration-200", open && "rotate-180")}
            />
          </span>
        </GhostButton>
      </GlassPanel>

      {open && (
        <GlassPanel
          variant="strong"
          intensity="high"
          elevation="popover"
          className="rounded-2xl p-1.5"
        >
          <Link
            href={profileHref}
            onClick={() => setOpen(false)}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium transition hover:bg-white/10",
              glassText.primaryElevated,
              "hover:text-glass-primary",
            )}
          >
            <User className="size-3.5" />
            Meu perfil
          </Link>

          <GhostButton
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full justify-start gap-2.5 px-3 py-2.5 text-left text-red-300 hover:bg-red-500/12 hover:text-red-200"
          >
            {loggingOut ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <LogOut className="size-3.5" />
            )}
            Sair
          </GhostButton>
        </GlassPanel>
      )}
    </div>
  );
}
