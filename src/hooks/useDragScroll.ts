"use client";

import { useCallback, useRef, type MouseEvent as ReactMouseEvent } from "react";

export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const dragState = useRef({ active: false, startX: 0, scrollLeft: 0 });

  const endDrag = useCallback(() => {
    dragState.current.active = false;
    document.body.style.removeProperty("cursor");
    document.body.style.removeProperty("user-select");
  }, []);

  const handleMouseDown = useCallback(
    (event: ReactMouseEvent<T>) => {
      const element = ref.current;
      if (!element) return;

      dragState.current = {
        active: true,
        startX: event.pageX,
        scrollLeft: element.scrollLeft,
      };

      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";

      function handleMouseMove(moveEvent: MouseEvent) {
        if (!dragState.current.active || !ref.current) return;

        moveEvent.preventDefault();
        const delta = moveEvent.pageX - dragState.current.startX;
        ref.current.scrollLeft = dragState.current.scrollLeft - delta;
      }

      function handleMouseUp() {
        endDrag();
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      }

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [endDrag],
  );

  return { ref, handleMouseDown };
}
