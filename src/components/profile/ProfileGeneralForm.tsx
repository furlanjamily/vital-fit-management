"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Briefcase, Mail, Phone, User } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { updateOwnProfileAction } from "@/app/(app)/profile/actions";
import { InlineAlert } from "@/components/common/feedback/InlineAlert";
import { Button } from "@/components/common/button/Button";
import { FormField, GlassInput, GlassSelect } from "@/components/common/form";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import { formatPhone } from "@/components/profile/profile.helpers";
import {
  profileGeneralSchema,
  type ProfileGeneralSchemaInput,
  type ProfileGeneralSchemaOutput,
} from "@/components/profile/profile.schema";
import {
  specialtyOptions,
  type ProfileSession,
} from "@/components/profile/profile.types";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

type ProfileGeneralFormProps = {
  session: ProfileSession;
  isEditing: boolean;
  avatarUrl: string | null;
  onProfileUpdated: (session: ProfileSession) => void;
  onCancelEdit: () => void;
};

function toFormValues(
  session: ProfileSession,
  avatarUrl: string | null,
): ProfileGeneralSchemaInput {
  return {
    fullName: session.displayName,
    email: session.email,
    phone: session.phone,
    specialty: session.specialty,
    avatarUrl,
  };
}

export function ProfileGeneralForm({
  session,
  isEditing,
  avatarUrl,
  onProfileUpdated,
  onCancelEdit,
}: ProfileGeneralFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileGeneralSchemaInput, unknown, ProfileGeneralSchemaOutput>({
    resolver: zodResolver(profileGeneralSchema),
    defaultValues: toFormValues(session, avatarUrl),
  });

  useEffect(() => {
    reset(toFormValues(session, avatarUrl));
  }, [session, avatarUrl, reset]);

  useEffect(() => {
    if (!isEditing) {
      reset(toFormValues(session, avatarUrl));
      setSubmitError(null);
    }
  }, [isEditing, reset, session, avatarUrl]);

  useEffect(() => {
    setValue("avatarUrl", avatarUrl, { shouldDirty: true });
  }, [avatarUrl, setValue]);

  async function onSubmit(values: ProfileGeneralSchemaOutput) {
    if (!isEditing) return;

    setSubmitError(null);
    setSuccessMessage(null);

    const result = await updateOwnProfileAction({
      ...values,
      avatarUrl,
    });

    if (!result.success) {
      setSubmitError(result.error);
      return;
    }

    const supabase = createClient();
    await supabase.auth.refreshSession();

    onProfileUpdated(result.data);
    setSuccessMessage("Informações atualizadas com sucesso.");
  }

  return (
    <GlassPanel
      variant="default"
      intensity="medium"
      elevation="floating"
      className="mb-6 rounded-2xl p-6"
    >
      <h2 className={cn(glassTextStyles.panelTitle, "mb-5 text-base")}>
        Informações Gerais
      </h2>

      {submitError ? (
        <InlineAlert className="mb-4 text-xs">{submitError}</InlineAlert>
      ) : null}

      {successMessage ? (
        <p
          role="status"
          className="mb-4 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300"
        >
          {successMessage}
        </p>
      ) : null}

      <form className="grid gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            label="Nome Completo"
            htmlFor="profile-full-name"
            error={isEditing ? errors.fullName?.message : undefined}
          >
            <GlassInput
              id="profile-full-name"
              leftIcon={User}
              autoComplete="name"
              placeholder="Seu nome completo"
              disabled={!isEditing}
              readOnly={!isEditing}
              invalid={isEditing && Boolean(errors.fullName)}
              {...register("fullName")}
            />
          </FormField>

          <FormField label="E-mail" htmlFor="profile-email" error={errors.email?.message}>
            <GlassInput
              id="profile-email"
              leftIcon={Mail}
              type="email"
              autoComplete="email"
              readOnly
              disabled
              invalid={Boolean(errors.email)}
              {...register("email")}
            />
          </FormField>

          <FormField
            label="Telefone / WhatsApp"
            htmlFor="profile-phone"
            error={isEditing ? errors.phone?.message : undefined}
          >
            <GlassInput
              id="profile-phone"
              leftIcon={Phone}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="(11) 99999-9999"
              maxLength={15}
              disabled={!isEditing}
              readOnly={!isEditing}
              invalid={isEditing && Boolean(errors.phone)}
              {...register("phone", {
                onChange: (event) => {
                  if (!isEditing) return;
                  setValue("phone", formatPhone(event.target.value), {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                },
              })}
            />
          </FormField>

          <FormField
            label="Setor / Especialidade / Atuação"
            htmlFor="profile-specialty"
            error={isEditing ? errors.specialty?.message : undefined}
          >
            <Controller
              name="specialty"
              control={control}
              render={({ field }) => (
                <GlassSelect
                  id="profile-specialty"
                  leftIcon={Briefcase}
                  options={specialtyOptions}
                  placeholder="Selecione a atuação"
                  value={field.value}
                  onChange={(event) => field.onChange(event.target.value)}
                  disabled={!isEditing}
                  invalid={isEditing && Boolean(errors.specialty)}
                  wrapperClassName="z-20"
                />
              )}
            />
          </FormField>
        </div>

        {isEditing ? (
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="glass"
              size="md"
              onClick={onCancelEdit}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
              Salvar alterações
            </Button>
          </div>
        ) : null}
      </form>

      <p className={cn(glassText.muted, "mt-3 text-[10px]")}>
        O e-mail é o identificador da conta e não pode ser alterado por aqui.
      </p>
    </GlassPanel>
  );
}
