"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/common/button/Button";
import { FormField, GlassInput, IconButton } from "@/components/common/form";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import {
  profilePasswordSchema,
  type ProfilePasswordSchemaOutput,
} from "@/components/profile/profile.schema";
import type { ProfilePasswordFormValues } from "@/components/profile/profile.types";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import { toastError, toastSuccess } from "@/lib/toast-utils";

const PASSWORD_REQUIREMENTS = [
  "Pelo menos 8 caracteres",
  "Pelo menos uma letra minúscula",
  "Pelo menos uma letra maiúscula",
] as const;

type ProfilePasswordFormProps = {
  email: string;
};

export function ProfilePasswordForm({ email }: ProfilePasswordFormProps) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfilePasswordFormValues, unknown, ProfilePasswordSchemaOutput>({
    resolver: zodResolver(profilePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  async function onSubmit(values: ProfilePasswordSchemaOutput) {
    if (!email) {
      toastError("Não foi possível identificar o e-mail da sessão.");
      return;
    }

    const supabase = createClient();

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email,
      password: values.currentPassword,
    });

    if (verifyError) {
      toastError("Senha atual incorreta.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: values.newPassword,
    });

    if (error) {
      toastError(error.message || "Não foi possível atualizar a senha.");
      return;
    }

    reset({ currentPassword: "", newPassword: "" });
    toastSuccess("Senha atualizada com sucesso.");
  }

  return (
    <GlassPanel
      variant="strong"
      intensity="high"
      elevation="popover"
      className="rounded-2xl p-6"
    >
      <h2 className={cn(glassTextStyles.panelTitle, "mb-5 text-base")}>
        Alteração de Senha
      </h2>

      <form className="grid gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            label="Senha Atual *"
            htmlFor="profile-current-password"
            error={errors.currentPassword?.message}
          >
            <GlassInput
              id="profile-current-password"
              leftIcon={Lock}
              type={showCurrent ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Digite sua senha atual"
              invalid={Boolean(errors.currentPassword)}
              rightSlot={
                <IconButton
                  shape="round"
                  size="sm"
                  variant="ghost"
                  aria-label={showCurrent ? "Ocultar senha atual" : "Mostrar senha atual"}
                  className={cn(
                    "mr-1 border-0 bg-transparent hover:bg-transparent",
                    glassText.tertiary,
                    "hover:text-glass-secondary",
                  )}
                  onClick={() => setShowCurrent((current) => !current)}
                >
                  {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </IconButton>
              }
              {...register("currentPassword")}
            />
          </FormField>

          <FormField
            label="Nova Senha *"
            htmlFor="profile-new-password"
            error={errors.newPassword?.message}
          >
            <GlassInput
              id="profile-new-password"
              leftIcon={Lock}
              type={showNew ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Digite a nova senha"
              invalid={Boolean(errors.newPassword)}
              rightSlot={
                <IconButton
                  shape="round"
                  size="sm"
                  variant="ghost"
                  aria-label={showNew ? "Ocultar nova senha" : "Mostrar nova senha"}
                  className={cn(
                    "mr-1 border-0 bg-transparent hover:bg-transparent",
                    glassText.tertiary,
                    "hover:text-glass-secondary",
                  )}
                  onClick={() => setShowNew((current) => !current)}
                >
                  {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </IconButton>
              }
              {...register("newPassword")}
            />
          </FormField>
        </div>

        <div className="grid gap-1">
          <p className="text-xs font-medium text-[#FF5E4A]/90">Requisitos da senha:</p>
          <ul className="flex flex-col gap-1 text-xs text-white/50">
            {PASSWORD_REQUIREMENTS.map((requirement) => (
              <li key={requirement}>• {requirement}</li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
            Atualizar senha
          </Button>
        </div>
      </form>
    </GlassPanel>
  );
}
