import { useRef } from "react";
import type { PointerEvent as ReactPointerEvent, MouseEvent as ReactMouseEvent } from "react";

type Clicky = (e: ReactMouseEvent<HTMLButtonElement>) => void;

/** Fires once per gesture: touch uses pointerup, mouse uses click. */
export function usePress(onClick: Clicky) {
  const fromPointer = useRef(false);
  return {
    onPointerUp: (e: ReactPointerEvent<HTMLButtonElement>) => {
      if (e.button !== 0) return;
      if (e.pointerType === "mouse") return;
      fromPointer.current = true;
      onClick(e as unknown as ReactMouseEvent<HTMLButtonElement>);
    },
    onClick: (e: ReactMouseEvent<HTMLButtonElement>) => {
      if (fromPointer.current) {
        fromPointer.current = false;
        return;
      }
      onClick(e);
    },
  };
}
