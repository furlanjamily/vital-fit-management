"use client";

import { useEffect, useState } from "react";
import type { UserRole } from "@/components/users/users.types";
import { resolveUserRole } from "@/lib/auth/resolve-user-role";
import { createClient } from "@/lib/supabase/client";

export function useSessionUserRole() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function loadRole() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      setRole(resolveUserRole(user.user_metadata));
      setLoading(false);
    }

    loadRole();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadRole();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { role, loading };
}
