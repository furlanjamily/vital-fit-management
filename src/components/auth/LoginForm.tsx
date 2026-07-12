"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useLoginForm } from "@/components/auth/useLoginForm";
import { InlineAlert } from "@/components/common/feedback/InlineAlert";
import {
  FormField,
  GlassButton,
  GlassInput,
  IconButton,
} from "@/components/common/form";
import { glassText } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

const DEFAULT_REDIRECT_PATH = "/dashboard";

type LoginFormProps = {
  redirectPath?: string;
};

export function LoginForm({ redirectPath = DEFAULT_REDIRECT_PATH }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { register, errors, isSubmitting, authError, onSubmit } =
    useLoginForm(redirectPath);

  return (
    <form className="grid gap-5" onSubmit={onSubmit} noValidate>
      {authError ? <InlineAlert>{authError}</InlineAlert> : null}

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
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              className={cn(
                "mr-1 size-8 border-0 bg-transparent hover:bg-transparent hover:text-glass-secondary",
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
