"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

export function useHydrated() {
  // No servidor retorna false; no cliente, true a partir da hidratação.
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
