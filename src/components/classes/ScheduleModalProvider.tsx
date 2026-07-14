"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ScheduleModal } from "@/components/classes/ScheduleModal";
import type { ClassRecord } from "@/services/class-manager";
import type { ManagedMember } from "@/components/members/members.types";

type ScheduleModalOptions = {
  defaultClassId?: string | null;
  slug?: string;
};

type ScheduleModalContextValue = {
  openScheduleModal: (options?: ScheduleModalOptions) => void;
  closeScheduleModal: () => void;
};

const ScheduleModalContext = createContext<ScheduleModalContextValue | null>(null);

type ScheduleModalProviderProps = {
  children: ReactNode;
  classes: ClassRecord[];
  members: ManagedMember[];
};

export function ScheduleModalProvider({
  children,
  classes,
  members,
}: ScheduleModalProviderProps) {
  const [open, setOpen] = useState(false);
  const [defaultClassId, setDefaultClassId] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | undefined>(undefined);

  const openScheduleModal = useCallback((options?: ScheduleModalOptions) => {
    setDefaultClassId(options?.defaultClassId ?? null);
    setSlug(options?.slug);
    setOpen(true);
  }, []);

  const closeScheduleModal = useCallback(() => {
    setOpen(false);
    setDefaultClassId(null);
    setSlug(undefined);
  }, []);

  const value = useMemo(
    () => ({ openScheduleModal, closeScheduleModal }),
    [openScheduleModal, closeScheduleModal],
  );

  return (
    <ScheduleModalContext.Provider value={value}>
      {children}
      {open ? (
        <ScheduleModal
          classes={classes}
          members={members}
          defaultClassId={defaultClassId}
          slug={slug}
          onClose={closeScheduleModal}
          onSuccess={closeScheduleModal}
        />
      ) : null}
    </ScheduleModalContext.Provider>
  );
}

export function useScheduleModal() {
  const context = useContext(ScheduleModalContext);

  if (!context) {
    throw new Error("useScheduleModal must be used within ScheduleModalProvider");
  }

  return context;
}
