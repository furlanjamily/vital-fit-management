"use client";

import { useEffect, useRef } from "react";
import { toastError } from "@/lib/toast-utils";

/** Exibe toast quando um erro de carga (SSR ou fetch) muda para um valor truthy. */
export function useToastOnError(error: string | null | undefined) {
  const lastError = useRef<string | null>(null);

  useEffect(() => {
    if (!error || error === lastError.current) return;
    lastError.current = error;
    toastError(error);
  }, [error]);
}
