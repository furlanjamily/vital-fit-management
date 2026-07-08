"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  FormField,
  GlassButton,
  GlassInput,
  IconButton,
} from "@/components/common/form";
import { createClient } from "@/lib/supabase/client";

const loginSchema = z.object({
  email: z.email("Informe um e-mail válido."),
  password: z
    .string()
    .min(8, "A senha deve ter no mínimo 8 caracteres.")
    .regex(/[A-Z]/, "Deve conter pelo menos uma letra maiúscula.")
    .regex(/[a-z]/, "Deve conter pelo menos uma letra minúscula.")
    .regex(/\d/, "Deve conter pelo menos um número.")
    .regex(/[^A-Za-z0-9]/, "Deve conter pelo menos um caractere especial."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

type LoginFormProps = {
  redirectPath?: string;
};

export function LoginForm({ redirectPath = "/dashboard" }: LoginFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setAuthError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setAuthError("Credenciais inválidas. Verifique seu e-mail e senha.");
      return;
    }

    router.push(redirectPath);
    router.refresh();
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      {authError ? (
        <p
          role="alert"
          className="rounded-xl border border-orange-400/20 bg-orange-400/10 px-4 py-3 text-sm text-orange-200/90"
        >
          {authError}
        </p>
      ) : null}

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
              className="mr-1 size-8 border-0 bg-transparent text-white/45 hover:bg-transparent hover:text-white/75"
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
