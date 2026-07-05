import type { ReactNode } from "react";
import { DesktopAppShell } from "@/components/app/DesktopAppShell";
import { MobilePageWrapper } from "@/components/mobile/MobilePageWrapper";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <MobilePageWrapper>{children}</MobilePageWrapper>
      <DesktopAppShell>{children}</DesktopAppShell>
    </>
  );
}
