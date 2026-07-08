"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { loginSchema, type LoginFormValues } from "@/components/auth/login.schema";
import { createClient } from "@/lib/supabase/client";

const INVALID_CREDENTIALS_MESSAGE =
  "Credenciais inválidas. Verifique seu e-mail e senha.";

export function useLoginForm(redirectPath: string) {
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function signIn(values: LoginFormValues) {
    setAuthError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword(values);

    if (error) {
      setAuthError(INVALID_CREDENTIALS_MESSAGE);
      return;
    }

    router.push(redirectPath);
    router.refresh();
  }

  return {
    register,
    errors,
    isSubmitting,
    authError,
    onSubmit: handleSubmit(signIn),
  };
}
