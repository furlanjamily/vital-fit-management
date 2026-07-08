import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";

export const metadata: Metadata = {
  title: "Login | VitalFit Management",
  description: "Acesso exclusivo para administradores do VitalFit Management.",
};

const DEFAULT_REDIRECT_PATH = "/dashboard";

function resolveRedirectPath(next?: string) {
  const isSafeInternalPath = next?.startsWith("/") && !next.startsWith("//");
  return isSafeInternalPath && next ? next : DEFAULT_REDIRECT_PATH;
}

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;

  return (
    <main className="flex h-dvh min-h-full w-full flex-col items-center justify-center overflow-hidden">
      <GlassPanel
        variant="hero"
        intensity="high"
        elevation="base"
        className="relative z-10 max-w-md rounded-[2rem]  shadow-[0_48px_150px_rgba(32,22,14,0.38)] sm:p-10"
      >
        <header className="mb-8 text-center">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/42">
            VitalFit Management
          </p>
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-white">
            Acesso Administrativo
          </h1>
          <p className="mt-2 text-sm text-white/52">
            Entre com suas credenciais para gerenciar a academia.
          </p>
        </header>

        <LoginForm redirectPath={resolveRedirectPath(next)} />
      </GlassPanel>
    </main>
  );
}
