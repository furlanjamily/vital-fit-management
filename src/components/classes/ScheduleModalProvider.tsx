"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ScheduleModal } from "@/components/classes/ScheduleModal";
import {
  OPEN_SCHEDULE_MODAL_EVENT,
  type OpenScheduleModalDetail,
} from "@/components/classes/schedule-modal-events";
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

  useEffect(() => {
    const handleOpen = (event: Event) => {
      const detail = (event as CustomEvent<OpenScheduleModalDetail>).detail;
      openScheduleModal(detail);
    };

    window.addEventListener(OPEN_SCHEDULE_MODAL_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_SCHEDULE_MODAL_EVENT, handleOpen);
  }, [openScheduleModal]);

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
