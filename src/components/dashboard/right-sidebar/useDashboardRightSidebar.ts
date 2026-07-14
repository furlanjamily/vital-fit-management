"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { getAgendaSidebarDataAction, type AgendaSidebarData } from "@/app/(app)/agenda/actions";
import { AGENDA_CHANGED_EVENT } from "@/components/agenda/agenda-events";
import {
  resolveSessionRoleLabel,
  formatUpNextCountdown,
} from "@/components/dashboard/right-sidebar/right-sidebar.helpers";
import type { AgendaEvent } from "@/components/agenda/agenda.types";
import {
  resolveAvatarUrl,
  resolveDisplayName,
} from "@/lib/auth/resolve-user-display";
import { createClient } from "@/lib/supabase/client";
import { isUserRole, roleLabels, type UserRole } from "@/components/users/users.types";

type SessionProfile = {
  displayName: string;
  roleLabel: string;
  avatarUrl: string | null;
};

const EMPTY_SIDEBAR_DATA: AgendaSidebarData = {
  upNext: null,
  upcomingTodayCount: 0,
  categoryCounts: { reuniao: 0, tarefa: 0, compromisso: 0 },
};

export function useDashboardRightSidebar() {
  const [profile, setProfile] = useState<SessionProfile | null>(null);
  const [sidebarData, setSidebarData] = useState<AgendaSidebarData>(EMPTY_SIDEBAR_DATA);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, startTransition] = useTransition();
  const [now, setNow] = useState(() => new Date());

  const refreshSidebar = useCallback(() => {
    startTransition(async () => {
      setLoadError(null);
      const result = await getAgendaSidebarDataAction();

      if (!result.success) {
        setLoadError(result.error);
        return;
      }

      setSidebarData(result.data);
    });
  }, []);

  useEffect(() => {
    const supabase = createClient();

    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setProfile(null);
        return;
      }

      const metadata = user.user_metadata ?? {};
      const rawRole = typeof metadata.role === "string" ? metadata.role.toUpperCase() : null;
      const roleLabel =
        rawRole && isUserRole(rawRole)
          ? roleLabels[rawRole as UserRole]
          : resolveSessionRoleLabel(metadata.role);

      setProfile({
        displayName: resolveDisplayName(metadata, user.email ?? undefined),
        roleLabel,
        avatarUrl: resolveAvatarUrl(metadata),
      });
    }

    loadProfile();
    refreshSidebar();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadProfile();
    });

    return () => subscription.unsubscribe();
  }, [refreshSidebar]);

  useEffect(() => {
    const handler = () => refreshSidebar();
    window.addEventListener(AGENDA_CHANGED_EVENT, handler);
    return () => window.removeEventListener(AGENDA_CHANGED_EVENT, handler);
  }, [refreshSidebar]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const upNextCountdown = useMemo(() => {
    if (!sidebarData.upNext) return null;
    return formatUpNextCountdown(sidebarData.upNext.startTime, now);
  }, [sidebarData.upNext, now]);

  const upNextEvent: AgendaEvent | null = sidebarData.upNext;

  return {
    profile,
    upNextEvent,
    upNextCountdown,
    upcomingTodayCount: sidebarData.upcomingTodayCount,
    categoryCounts: sidebarData.categoryCounts,
    loadError,
    isLoading,
    refreshSidebar,
  };
}
