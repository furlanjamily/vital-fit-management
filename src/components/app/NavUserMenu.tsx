"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, LogOut, User } from "lucide-react";
import { GhostButton } from "@/components/common/form";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import { UserAvatar } from "@/components/users/UserAvatar";
import { profileHref } from "@/config/app-nav.config";
import { useHydrated } from "@/hooks/useHydrated";
import { DEMO_LOGOUT_DISABLED } from "@/config/demo-auth";
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

type MenuPosition = {
  bottom: number;
  left: number;
  width: number;
};

interface NavUserMenuProps {
  /** Só avatar no trigger; nome aparece no dropdown acima de "Meu perfil". */
  compact?: boolean;
}

type MenuPanelProps = {
  sessionUser: SessionUser;
  compact: boolean;
  loggingOut: boolean;
  logoutDisabled: boolean;
  onClose: () => void;
  onLogout: () => void;
  className?: string;
};

function UserMenuPanel({
  sessionUser,
  compact,
  loggingOut,
  logoutDisabled,
  onClose,
  onLogout,
  className,
}: MenuPanelProps) {
  return (
    <GlassPanel
      role="menu"
      variant="strong"
      intensity="high"
      elevation="solid"
      className={cn("rounded-2xl p-1.5", className)}
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
        onClick={onClose}
        className={cn("justify-start text-left", glassText.primaryElevated)}
      >
        Meu perfil
      </GhostButton>

      <GhostButton
        transparent
        fullWidth
        size="sm"
        onClick={onLogout}
        disabled={logoutDisabled || loggingOut}
        isLoading={loggingOut}
        title={logoutDisabled ? "Saída desabilitada no modo demonstração" : undefined}
        className="justify-start text-left text-red-500 hover:text-red-600 disabled:opacity-40"
        leftIcon={<LogOut className="size-3.5" />}
      >
        Sair
      </GhostButton>
    </GlassPanel>
  );
}

export function NavUserMenu({ compact = false }: NavUserMenuProps) {
  const router = useRouter();
  const hydrated = useHydrated();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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

  function updatePosition() {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const gap = 8;
    const menuWidth = 224;

    setPosition({
      bottom: window.innerHeight - rect.top + gap,
      left: Math.max(8, rect.right - menuWidth),
      width: menuWidth,
    });
  }

  // Portal + posição fixa só no compact (mobile). Na sidebar, o menu fica no fluxo 3D.
  useLayoutEffect(() => {
    if (!compact || !open) {
      setPosition(null);
      return;
    }

    updatePosition();

    function handleReposition() {
      updatePosition();
    }

    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open, compact]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  async function handleLogout() {
    if (DEMO_LOGOUT_DISABLED) return;

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

  const menuContent = (
    <UserMenuPanel
      sessionUser={sessionUser}
      compact={compact}
      loggingOut={loggingOut}
      logoutDisabled={DEMO_LOGOUT_DISABLED}
      onClose={() => setOpen(false)}
      onLogout={handleLogout}
      className={
        compact
          ? "shadow-[0_20px_50px_-12px_rgba(0,0,0,0.55)]"
          : undefined
      }
    />
  );

  const compactPortalMenu =
    compact && open && hydrated && position
      ? createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              bottom: position.bottom,
              left: position.left,
              width: position.width,
              zIndex: 9999,
              pointerEvents: "auto",
            }}
          >
            {menuContent}
          </div>,
          document.body,
        )
      : null;

  return (
    <div
      ref={containerRef}
      className={cn(
        !compact && "flex flex-col-reverse gap-2",
        compact && "relative",
        open && !compact && "relative z-50",
      )}
    >
      <div ref={triggerRef}>
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
      </div>

      {/* Sidebar: no fluxo 3D da coluna, acompanha a rotação do painel */}
      {!compact && open ? (
        <div ref={menuRef} className="relative z-50">
          {menuContent}
        </div>
      ) : null}

      {compactPortalMenu}
    </div>
  );
}
