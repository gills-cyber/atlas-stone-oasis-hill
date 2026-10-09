import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn, clamp } from "@/lib/utils";
import { LETTER_FONT_MAX, LETTER_FONT_MIN } from "@/lib/manga/lettering";

const PRESETS = [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 18, 24, 28, 36, 48, 64, 72, 96];

export function FontSizeControl({
  value,
  onChange,
  compact = false,
}: {
  value: number;
  onChange: (size: number) => void;
  compact?: boolean;
}) {
  const [draft, setDraft] = useState(String(value));
  const [open, setOpen] = useState(false);
  const focused = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!focused.current) setDraft(String(value));
  }, [value]);

  useEffect(() => {
    if (!open) return;
    function close(e: PointerEvent) {
      if (rootRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [open]);

  function commit(raw: string) {
    const n = parseFloat(raw.replace(/[^\d.]/g, ""));
    if (!Number.isFinite(n)) {
      setDraft(String(value));
      return;
    }
    const next = clamp(Math.round(n), LETTER_FONT_MIN, LETTER_FONT_MAX);
    onChange(next);
    setDraft(String(next));
  }

  function step(delta: number) {
    const next = clamp(value + delta, LETTER_FONT_MIN, LETTER_FONT_MAX);
    onChange(next);
    setDraft(String(next));
  }

  return (
    <div ref={rootRef} className={cn("flex items-center", compact ? "gap-0" : "gap-1")}>
      {compact ? null : (
        <button
          type="button"
          aria-label="Decrease size"
          onClick={() => step(-1)}
          className="flex size-8 items-center justify-center rounded-md bg-ink/5 text-sm font-medium hover:bg-ink/10"
        >
          −
        </button>
      )}
      <div className={cn("relative flex items-center", compact ? "w-[3.25rem]" : "min-w-0 flex-1")}>
        <input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          aria-label="Font size"
          data-koma="font-size"
          value={draft}
          onFocus={(e) => {
            focused.current = true;
            e.currentTarget.select();
          }}
          onBlur={() => {
            focused.current = false;
            commit(draft);
          }}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter") {
              e.preventDefault();
              commit(draft);
              e.currentTarget.blur();
            } else if (e.key === "Escape") {
              e.preventDefault();
              setDraft(String(value));
              e.currentTarget.blur();
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              step(e.shiftKey ? 10 : 1);
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              step(e.shiftKey ? -10 : -1);
            }
          }}
          className={cn(
            "h-8 rounded-md bg-ink/5 text-center text-[16px] tabular-nums text-ink outline-none md:h-7 md:text-[13px]",
            compact ? "w-full px-1" : "w-full px-2 pr-8",
            "focus:ring-2 focus:ring-accent/40",
          )}
        />
        {compact ? null : (
          <>
        <span className="pointer-events-none absolute right-7 text-[11px] text-muted">
            pt
          </span>
        <button
          type="button"
          aria-label="Size presets"
          aria-expanded={open}
          onPointerDown={(e) => e.preventDefault()}
          onClick={() => setOpen((v) => !v)}
          className="absolute right-0.5 flex size-7 items-center justify-center rounded-md text-muted hover:bg-ink/8 hover:text-ink"
        >
          <ChevronDown className="size-3.5" />
        </button>
          </>
        )}
        {open ? (
          <div
            role="listbox"
            className="absolute left-0 top-9 z-50 max-h-56 w-full overflow-y-auto rounded-md bg-surface py-1 shadow-float"
          >
            {PRESETS.map((n) => (
              <button
                key={n}
                type="button"
                role="option"
                aria-selected={n === value}
                onClick={() => {
                  onChange(n);
                  setOpen(false);
                }}
                className={cn(
                  "flex h-8 w-full items-center justify-center text-[13px] tabular-nums",
                  n === value
                    ? "bg-ink/10 font-medium"
                    : "text-ink hover:bg-ink/6",
                )}
              >
                {n}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      {compact ? null : (
        <button
          type="button"
          aria-label="Increase size"
          onClick={() => step(1)}
          className="flex size-8 items-center justify-center rounded-md bg-ink/5 text-sm font-medium hover:bg-ink/10"
        >
          +
        </button>
      )}
    </div>
  );
}
