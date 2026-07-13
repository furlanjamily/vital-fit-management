import { DashboardContentClient } from "@/components/dashboard/DashboardContentClient";

type DashboardContentProps = {
  userName?: string | null;
};

export function DashboardContent({ userName }: DashboardContentProps) {
  return <DashboardContentClient userName={userName} />;
}
