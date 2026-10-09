import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ContextItem = {
  label: string;
  disabled?: boolean;
  danger?: boolean;
  mark?: string;
  keepOpen?: boolean;
  onClick?: () => void;
};

export function ContextMenu({
  x,
  y,
  items,
  extra,
  onClose,
}: {
  x: number;
  y: number;
  items: ContextItem[];
  extra?: ReactNode;
  onClose: () => void;
}) {
  const left = Math.min(x, (typeof window !== "undefined" ? window.innerWidth : x) - 220);
  const top = Math.min(
    y,
    (typeof window !== "undefined" ? window.innerHeight : y) - items.length * 44 - (extra ? 88 : 16),
  );
  const originX = Math.max(12, x - Math.max(8, left));
  const originY = Math.max(12, y - Math.max(8, top));

  useEffect(() => {
    function onPointer(e: PointerEvent) {
      if (e.button === 2) return;
      const t = e.target;
      if (t instanceof Element && t.closest("[data-koma-menu]")) return;
      onClose();
    }
    function onContext(e: Event) {
      e.preventDefault();
      const t = e.target;
      if (
        t instanceof Element &&
        t.closest("[data-koma='page-rail'],[data-koma='page-rail-mobile']")
      ) {
        return;
      }
      onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("contextmenu", onContext, true);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("contextmenu", onContext, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      role="menu"
      data-koma-menu
      className="koma-pop-in fixed z-[100] min-w-[13.5rem] rounded-[12px] bg-surface/92 py-1.5 shadow-float backdrop-blur-2xl"
      style={{
        left: Math.max(8, left),
        top: Math.max(8, top),
        ["--koma-origin" as string]: `${originX}px ${originY}px`,
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {items.map((item) => (
        <button
          key={item.mark ?? item.label}
          type="button"
          role="menuitem"
          data-koma={item.mark}
          disabled={item.disabled}
          onClick={() => {
            if (item.disabled) return;
            item.onClick?.();
            if (!item.keepOpen) onClose();
          }}
          className={cn(
            "koma-menu-item flex min-h-11 w-full items-center px-3 text-left text-[15px] md:min-h-8 md:text-[13px]",
            item.danger ? "text-hanko" : "text-ink",
            item.disabled ? "opacity-40" : "hover:bg-ink/8",
          )}
        >
          {item.label}
        </button>
      ))}
      {extra}
    </div>
  );
}
