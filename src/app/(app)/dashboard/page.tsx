import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { resolveFirstName } from "@/lib/auth/resolve-user-display";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userName = user
    ? resolveFirstName(user.user_metadata ?? {}, user.email ?? undefined)
    : null;

  return <DashboardContent userName={userName} />;
}
