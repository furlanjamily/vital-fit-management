import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { BrandWordmark } from "@/components/brand/BrandWordmark";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

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
    <main className="flex h-dvh min-h-full w-full flex-col items-center justify-center overflow-hidden p-4">
      <GlassPanel
        variant="hero"
        intensity="high"
        elevation="base"
        className="relative z-10 max-w-sm rounded-[2rem] bg-transparent p-10 backdrop-blur-none sm:max-w-md lg:max-w-lg"
      >
        <header className="mb-8 text-center">
          <div className="mb-6 flex flex-col items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/vital-fit-logo.png"
              alt=""
              className="h-14 w-auto object-contain sm:h-16"
            />
            <BrandWordmark className="text-3xl sm:text-4xl" />
          </div>
          <h1 className={cn(glassText.primary, "text-2xl font-semibold tracking-[-0.03em]")}>
            Acesso Administrativo
          </h1>
          <p className={cn(glassText.secondary, "mt-2 text-sm")}>
            Entre com suas credenciais para gerenciar a academia.
          </p>
        </header>

        <LoginForm redirectPath={resolveRedirectPath(next)} />
      </GlassPanel>
    </main>
  );
}
