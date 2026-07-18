"use client";

import { useId, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { X } from "lucide-react";
import { IconButton } from "@/components/common/form";
import { useHydrated } from "@/hooks/useHydrated";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

export type ResponsiveModalSize = "sm" | "md" | "lg" | "xl";

export interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  /** Exposed as `aria-describedby` for screen readers. */
  description?: string;
  children: ReactNode;
  /**
   * Desktop slide-over width. Default `md` = 450px.
   * Mobile always spans the full viewport width.
   */
  size?: ResponsiveModalSize;
  /** Optional actions rendered in the header (before the close button). */
  headerActions?: ReactNode;
  /** Optional class on the scrollable body. */
  className?: string;
}

const DESKTOP_WIDTH: Record<ResponsiveModalSize, string> = {
  sm: "md:w-[380px]",
  md: "md:w-[450px]",
  lg: "md:w-[520px]",
  xl: "md:w-[600px]",
};

const OVERLAY_CLASS =
  "fixed inset-0 z-100 bg-black/40 backdrop-blur-[8px]";

const PANEL_CLASS = cn(
  "fixed z-101 flex flex-col outline-none",
  "bg-[#130F0C]/85 backdrop-blur-[30px] border-white/12 shadow-2xl",
  // Mobile — bottom sheet
  "bottom-0 left-0 right-0 max-h-[85vh] rounded-t-[32px] border-t",
  // Desktop — right slide-over
  "md:top-0 md:bottom-0 md:right-0 md:left-auto",
  "md:h-screen md:max-h-screen",
  "md:rounded-t-none md:rounded-l-[32px] md:border-t-0 md:border-l",
);

function ModalCloseButton({ onClick }: { onClick: () => void }) {
  return (
    <IconButton
      shape="round"
      size="sm"
      variant="ghost"
      aria-label="Fechar"
      onClick={onClick}
      className="shrink-0 text-white/60 hover:bg-white/10 hover:text-white"
    >
      <X className="size-4" aria-hidden="true" />
    </IconButton>
  );
}

function buildDrawerVariants(isMobile: boolean, reduceMotion: boolean): Variants {
  if (reduceMotion) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0 } },
      exit: { opacity: 0, transition: { duration: 0 } },
    };
  }

  return {
    hidden: {
      x: isMobile ? 0 : "100%",
      y: isMobile ? "100%" : 0,
    },
    visible: {
      x: 0,
      y: 0,
      transition: { type: "spring", damping: 25, stiffness: 200 },
    },
    exit: {
      x: isMobile ? 0 : "100%",
      y: isMobile ? "100%" : 0,
      transition: { ease: "easeInOut", duration: 0.25 },
    },
  };
}

/**
 * Hybrid drawer: bottom sheet below `md`, right slide-over from `md` up.
 * ESC, focus trap and overlay dismiss come from Radix Dialog.
 */
export function ResponsiveModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  headerActions,
  className,
}: ResponsiveModalProps) {
  const hydrated = useHydrated();
  const isMobile = useIsMobile();
  const prefersReducedMotion = usePrefersReducedMotion();
  const titleId = useId();
  const descriptionId = useId();
  const drawerVariants = buildDrawerVariants(isMobile, prefersReducedMotion);

  if (!hydrated) {
    return null;
  }

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <AnimatePresence>
        {isOpen ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className={OVERLAY_CLASS}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
              />
            </Dialog.Overlay>

            <Dialog.Content
              asChild
              forceMount
              aria-describedby={description ? descriptionId : undefined}
              // Fallback se algum portal não usar DismissableLayer.Branch.
              onPointerDownOutside={(event) => {
                const target = event.target as HTMLElement | null;
                if (target?.closest("[data-glass-portal]")) {
                  event.preventDefault();
                }
              }}
              onInteractOutside={(event) => {
                const target = event.target as HTMLElement | null;
                if (target?.closest("[data-glass-portal]")) {
                  event.preventDefault();
                }
              }}
              onFocusOutside={(event) => {
                const target = event.target as HTMLElement | null;
                if (target?.closest("[data-glass-portal]")) {
                  event.preventDefault();
                }
              }}
            >
              <motion.div
                className={cn(PANEL_CLASS, DESKTOP_WIDTH[size], glassText.secondary)}
                variants={drawerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {/* iOS drag affordance — mobile only */}
                <div
                  aria-hidden="true"
                  className="mx-auto my-3 h-1.5 w-12 shrink-0 rounded-full bg-white/20 md:hidden"
                />

                <div
                  className={cn(
                    "relative flex min-h-0 flex-1 flex-col",
                    "px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]",
                    "md:px-6 md:pb-6 md:pt-6",
                  )}
                >
                  {!title ? (
                    <Dialog.Title className="sr-only">Dialog</Dialog.Title>
                  ) : null}

                  {title || description || headerActions ? (
                    <div className="mb-4 flex items-start justify-between gap-3 md:mb-5">
                      <div className="min-w-0 flex-1">
                        {title ? (
                          <Dialog.Title
                            id={titleId}
                            className={cn(
                              glassTextStyles.modalTitle,
                              "md:text-base md:tracking-[-0.02em]",
                            )}
                          >
                            {title}
                          </Dialog.Title>
                        ) : null}
                        {description ? (
                          <Dialog.Description
                            id={descriptionId}
                            className={cn("mt-1 text-sm", glassText.muted)}
                          >
                            {description}
                          </Dialog.Description>
                        ) : null}
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        {headerActions}
                        <ModalCloseButton onClick={onClose} />
                      </div>
                    </div>
                  ) : (
                    <div className="absolute right-4 top-4 z-10 md:right-5 md:top-5">
                      <ModalCloseButton onClick={onClose} />
                    </div>
                  )}

                  <div
                    className={cn(
                      "min-h-0 flex-1 overflow-y-auto overscroll-contain",
                      className,
                    )}
                  >
                    {children}
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}

/** Alias for call sites that think in “drawer” terms. */
export const ResponsiveDrawer = ResponsiveModal;
