import { useEffect, useRef, useState } from "react";
import {
  FONT_GROUPS,
  LETTER_FONTS,
  defaultFontId,
  letterFont,
} from "@/lib/manga/fonts";
import { cn } from "@/lib/utils";

export function FontFamilyControl({
  value,
  kind,
  onChange,
  compact = false,
}: {
  value?: string | null;
  kind?: string;
  onChange: (id: string) => void;
  compact?: boolean;
}) {
  const current = letterFont(value || defaultFontId(kind));
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function close(e: PointerEvent) {
      if (rootRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [open]);

  if (compact) {
    return (
      <div ref={rootRef} className="relative">
        <button
          type="button"
          data-koma="font-family"
          aria-label="Font"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="min-w-[5.5rem] px-2 text-left"
          style={{ fontFamily: current.css }}
        >
          {current.label}
        </button>
        {open ? (
          <div className="absolute left-0 top-[calc(100%+6px)] z-[80] max-h-72 w-48 overflow-auto rounded-lg bg-surface p-1 shadow-float">
            {LETTER_FONTS.map((font) => (
              <button
                key={font.id}
                type="button"
                data-active={font.id === current.id ? "true" : undefined}
                className="flex h-8 w-full items-center rounded-md px-2 text-left text-[13px]"
                style={{ fontFamily: font.css }}
                onClick={() => {
                  onChange(font.id);
                  setOpen(false);
                }}
              >
                {font.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div data-koma="font-family">
      {FONT_GROUPS.map((group) => (
        <div key={group.id} className="mb-2">
          <p className="mb-1 text-[11px] font-medium text-muted">{group.label}</p>
          <div className="grid grid-cols-2 gap-1">
            {LETTER_FONTS.filter((f) => f.group === group.id).map((font) => (
              <button
                key={font.id}
                type="button"
                aria-pressed={font.id === current.id}
                onClick={() => onChange(font.id)}
                className={cn(
                  "min-h-11 rounded-md px-2 py-1.5 text-left text-sm",
                  font.id === current.id
                    ? "bg-ink text-paper"
                    : "bg-ink/5 hover:bg-ink/10",
                )}
                style={{ fontFamily: font.css }}
              >
                {font.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
