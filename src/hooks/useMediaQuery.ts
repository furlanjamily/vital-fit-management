"use client";

import { useSyncExternalStore } from "react";

function subscribe(query: string, callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const mediaQueryList = window.matchMedia(query);
  mediaQueryList.addEventListener("change", callback);

  return () => mediaQueryList.removeEventListener("change", callback);
}

function getSnapshot(query: string) {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia(query).matches;
}

/**
 * Subscribes to a CSS media query. SSR / first paint assume `false`
 * (desktop) to avoid hydration mismatches; pair with `useHydrated` when
 * the UI must wait for the real viewport.
 */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (callback) => subscribe(query, callback),
    () => getSnapshot(query),
    () => false,
  );
}

/**
 * Below Tailwind `md` (768px). Matches `max-md` / mobile-first drawers.
 */
export const MOBILE_MEDIA_QUERY = "(max-width: 767px)";

export function useIsMobile() {
  return useMediaQuery(MOBILE_MEDIA_QUERY);
}
