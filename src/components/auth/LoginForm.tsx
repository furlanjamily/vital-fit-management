"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { DEMO_AUTH_ENABLED, DEMO_USER } from "@/config/demo-auth";
import { useLoginForm } from "@/components/auth/useLoginForm";
import {
  FormField,
  GlassButton,
  GlassInput,
  IconButton,
} from "@/components/common/form";
import { glassText } from "@/config/glass-typography";
import { createClient } from "@/lib/supabase/client";
import { toastError } from "@/lib/toast-utils";
import { cn } from "@/lib/cn";

const DEFAULT_REDIRECT_PATH = "/dashboard";
const INVALID_CREDENTIALS_MESSAGE =
  "Credenciais inválidas. Verifique se o usuário demo foi criado (`npm run seed:demo`).";

type LoginFormProps = {
  redirectPath?: string;
};

export function LoginForm({ redirectPath = DEFAULT_REDIRECT_PATH }: LoginFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [demoSubmitting, setDemoSubmitting] = useState(false);
  const { register, errors, isSubmitting, onSubmit } = useLoginForm(redirectPath);

  async function handleDemoLogin() {
    setDemoSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: DEMO_USER.email,
        password: DEMO_USER.password,
      });

      if (error) {
        toastError(INVALID_CREDENTIALS_MESSAGE);
        return;
      }

      router.push(redirectPath);
      router.refresh();
    } catch {
      toastError(INVALID_CREDENTIALS_MESSAGE);
    } finally {
      setDemoSubmitting(false);
    }
  }

  if (DEMO_AUTH_ENABLED) {
    return (
      <div className="grid gap-5">
        <div
          className={cn(
            "rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center",
            glassText.secondary,
          )}
        >
          <p className="text-sm">
            Acesso em modo demonstração
          </p>
          <p className={cn("mt-1 text-[11px]", glassText.muted)}>
            {DEMO_USER.email}
          </p>
        </div>

        <GlassButton
          type="button"
          variant="default"
          shape="pill"
          fullWidth
          loading={demoSubmitting}
          className="mt-1"
          onClick={handleDemoLogin}
        >
          {demoSubmitting ? "Entrando..." : `Entrar como ${DEMO_USER.displayName}`}
        </GlassButton>
      </div>
    );
  }

  return (
    <form className="grid gap-5" onSubmit={onSubmit} noValidate>
      <FormField label="E-mail" htmlFor="email" error={errors.email?.message}>
        <GlassInput
          id="email"
          type="email"
          tone="login"
          autoComplete="email"
          placeholder="admin@vitalfit.com"
          invalid={Boolean(errors.email)}
          {...register("email")}
        />
      </FormField>

      <FormField label="Senha" htmlFor="password" error={errors.password?.message}>
        <GlassInput
          id="password"
          type={showPassword ? "text" : "password"}
          tone="login"
          autoComplete="current-password"
          placeholder="••••••••"
          invalid={Boolean(errors.password)}
          rightSlot={
            <IconButton
              shape="round"
              size="sm"
              variant="ghost"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              className={cn(
                "mr-1 border-0 bg-transparent hover:bg-transparent hover:text-glass-secondary",
                glassText.tertiary,
              )}
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </IconButton>
          }
          {...register("password")}
        />
      </FormField>

      <GlassButton
        type="submit"
        variant="default"
        shape="pill"
        fullWidth
        loading={isSubmitting}
        className="mt-1"
      >
        {isSubmitting ? "Entrando..." : "Entrar"}
      </GlassButton>
    </form>
  );
}
