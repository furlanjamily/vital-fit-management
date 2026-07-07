"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import { GlassButton } from "@/components/common/button/glass-button";

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

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/32 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-colors focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-[#8ad5ff]/25";

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

      <div className="grid gap-2">
        <label htmlFor="email" className="text-xs font-semibold tracking-wide text-white/55">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="admin@vitalfit.com"
          className={cn(inputClassName, errors.email && "border-orange-400/30")}
          {...register("email")}
        />
        {errors.email ? (
          <p className="text-xs text-orange-300/90">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <label htmlFor="password" className="text-xs font-semibold tracking-wide text-white/55">
          Senha
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            className={cn(inputClassName, "pr-12", errors.password && "border-orange-400/30")}
            {...register("password")}
          />
          <button
            type="button"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-white/45 transition-colors hover:text-white/75"
            onClick={() => setShowPassword((current) => !current)}
          >
            {showPassword ? <EyeOff className="size-4 text-gray-600" /> : <Eye className="size-4 text-gray-600" />}
          </button>
        </div>
        {errors.password ? (
          <p className="text-xs text-orange-300/90">{errors.password.message}</p>
        ) : null}
      </div>

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
