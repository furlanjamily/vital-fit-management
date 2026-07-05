import { CenterPanelShell } from "@/components/app/CenterPanelShell";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

export function CenterDashboardPanel() {
  return (
    <CenterPanelShell>
      <DashboardContent />
    </CenterPanelShell>
  );
}
