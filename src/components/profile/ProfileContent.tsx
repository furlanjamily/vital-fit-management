"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/common/button/Button";
import { AvatarUploadTrigger } from "@/components/common/form";
import { ProfileGeneralForm } from "@/components/profile/ProfileGeneralForm";
import { ProfilePasswordForm } from "@/components/profile/ProfilePasswordForm";
import { ProfileSkeleton } from "@/components/profile/ProfileSkeleton";
import { mapUserToProfileSession } from "@/components/profile/profile.helpers";
import type { ProfileSession } from "@/components/profile/profile.types";
import { UserAvatar } from "@/components/users/UserAvatar";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { useToastOnError } from "@/hooks/useToastOnError";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

const FULL_NAME_INPUT_ID = "profile-full-name";

export function ProfileContent() {
  const [session, setSession] = useState<ProfileSession | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [draftAvatarUrl, setDraftAvatarUrl] = useState<string | null>(null);
  const isEditingRef = useRef(isEditing);

  useToastOnError(loadError);

  useEffect(() => {
    isEditingRef.current = isEditing;
  }, [isEditing]);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function loadProfile() {
      setIsLoading(true);
      setLoadError(null);

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!active) return;

      if (error || !user) {
        setSession(null);
        setLoadError("Não foi possível carregar o perfil. Faça login novamente.");
        setIsLoading(false);
        return;
      }

      const nextSession = mapUserToProfileSession(user);
      setSession(nextSession);
      setDraftAvatarUrl(nextSession.avatarUrl);
      setIsLoading(false);
    }

    loadProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, authSession) => {
      if (!active) return;
      if (authSession?.user) {
        const nextSession = mapUserToProfileSession(authSession.user);
        setSession(nextSession);
        if (!isEditingRef.current) {
          setDraftAvatarUrl(nextSession.avatarUrl);
        }
        setLoadError(null);
      } else {
        setSession(null);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  function enterEditMode() {
    setDraftAvatarUrl(session?.avatarUrl ?? null);
    setIsEditing(true);

    window.requestAnimationFrame(() => {
      const input = document.getElementById(FULL_NAME_INPUT_ID);
      if (!(input instanceof HTMLInputElement)) return;

      input.scrollIntoView({ behavior: "smooth", block: "center" });
      window.setTimeout(() => input.focus(), 320);
    });
  }

  function cancelEditMode() {
    setDraftAvatarUrl(session?.avatarUrl ?? null);
    setIsEditing(false);
  }

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (loadError || !session) {
    return (
      <div className="py-6">
        <p className={cn("text-sm", glassText.muted)}>
          {loadError ?? "Sessão não encontrada."}
        </p>
      </div>
    );
  }

  const displayName = session.displayName;

  return (
    <div className="flex flex-col pb-4">
      <header className="mb-6 shrink-0">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className={cn(glassText.secondary, "text-xs font-semibold")}>Perfil</p>
          <Button
            type="button"
            variant="glass"
            size="sm"
            onClick={isEditing ? cancelEditMode : enterEditMode}
            aria-label={
              isEditing
                ? "Cancelar edição do perfil"
                : "Editar informações do perfil"
            }
          >
            {isEditing ? "Cancelar" : "Editar"}
          </Button>
        </div>

        <div className="text-center">
          {isEditing ? (
            <AvatarUploadTrigger
              name={displayName}
              avatarUrl={draftAvatarUrl}
              onImageSelected={setDraftAvatarUrl}
              hint="Clique ou arraste para trocar a foto"
              avatarClassName="size-[82px] border border-white/80 ring-2 ring-white/20"
              avatarTextClassName="text-xl"
            />
          ) : (
            <UserAvatar
              name={displayName}
              avatarUrl={session.avatarUrl}
              className="mx-auto size-[82px] border border-white/80 ring-2 ring-white/20"
              textClassName="text-xl"
            />
          )}
          <p className={cn(glassTextStyles.panelTitle, isEditing ? "mt-1 text-sm" : "mt-3 text-sm")}>
            {displayName}
          </p>
          <p className={glassTextStyles.entityEmail}>{session.roleLabel}</p>
        </div>
      </header>

      <ProfileGeneralForm
        session={session}
        isEditing={isEditing}
        avatarUrl={draftAvatarUrl}
        onProfileUpdated={(nextSession) => {
          setSession(nextSession);
          setDraftAvatarUrl(nextSession.avatarUrl);
          setIsEditing(false);
        }}
        onCancelEdit={cancelEditMode}
      />

      <ProfilePasswordForm email={session.email} />
    </div>
  );
}
