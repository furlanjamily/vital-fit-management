import type { ReactNode } from "react";
import { DesktopAppShell } from "@/components/app/DesktopAppShell";
import { ClassesAppProviders } from "@/components/classes/ClassesAppProviders";
import { MobilePageWrapper } from "@/components/mobile/MobilePageWrapper";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ClassesAppProviders>
      <MobilePageWrapper>{children}</MobilePageWrapper>
      <DesktopAppShell>{children}</DesktopAppShell>
    </ClassesAppProviders>
  );
}
