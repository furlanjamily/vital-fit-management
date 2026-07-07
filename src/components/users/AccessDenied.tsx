import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { GlassPanel } from "@/components/common/glass-panel/glass-panel";

export function AccessDenied() {
  return (
    <div className="grid min-h-full place-items-center py-16">
      <GlassPanel
        variant="subtle"
        intensity="low"
        elevation="floating"
        className="w-full max-w-md rounded-2xl p-8 text-center"
      >
        <span className="mx-auto mb-5 grid size-14 place-items-center rounded-full border border-white/14 bg-white/7">
          <ShieldAlert className="size-6 text-white/70" />
        </span>

        <h1 className="text-xl font-semibold tracking-[-0.03em] text-white">
          Acesso restrito
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-white/48">
          Esta área é exclusiva para Super Admins. Fale com um administrador do
          sistema se você precisa de acesso.
        </p>

        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#1a1d19] transition hover:bg-white/92"
        >
          Voltar ao Dashboard
        </Link>
      </GlassPanel>
    </div>
  );
}
