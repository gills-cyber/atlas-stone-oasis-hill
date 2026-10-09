export function insertIndexFromMidpoints(mids: number[], point: number) {
  for (let i = 0; i < mids.length; i++) {
    if (point < mids[i]!) return i;
  }
  return mids.length;
}

export function insertIndexFromRects(
  rects: { top: number; left: number; width: number; height: number }[],
  point: { x: number; y: number },
  axis: "x" | "y",
) {
  const mids = rects.map((r) =>
    axis === "y" ? r.top + r.height / 2 : r.left + r.width / 2,
  );
  return insertIndexFromMidpoints(mids, axis === "y" ? point.y : point.x);
}

export function gapPositionFromRects(
  rects: { top: number; left: number; width: number; height: number }[],
  insertAt: number,
  axis: "x" | "y",
) {
  if (!rects.length) return 0;
  const first = rects[0]!;
  const last = rects[rects.length - 1]!;
  if (axis === "y") {
    if (insertAt <= 0) return first.top;
    if (insertAt >= rects.length) return last.top + last.height;
    const prev = rects[insertAt - 1]!;
    const next = rects[insertAt]!;
    return (prev.top + prev.height + next.top) / 2;
  }
  if (insertAt <= 0) return first.left;
  if (insertAt >= rects.length) return last.left + last.width;
  const prev = rects[insertAt - 1]!;
  const next = rects[insertAt]!;
  return (prev.left + prev.width + next.left) / 2;
}

/** User-facing folio (“7” or “cover”) → destination index in the current list. */
export function folioToPageIndex(
  folio: number,
  pageCount: number,
  coverFirst: boolean,
) {
  if (pageCount <= 0) return 0;
  if (coverFirst) {
    const maxFolio = Math.max(1, pageCount - 1);
    return Math.min(maxFolio, Math.max(1, Math.round(folio)));
  }
  return Math.min(pageCount, Math.max(1, Math.round(folio))) - 1;
}

export function parseSendTo(raw: string): number | "cover" | null {
  const s = raw.trim().toLowerCase();
  if (!s) return null;
  if (s === "cover" || s === "c") return "cover";
  const n = Number.parseInt(s, 10);
  if (!Number.isFinite(n) || n < 0) return null;
  if (n === 0) return "cover";
  return n;
}

export function labelForIndex(index: number, coverFirst: boolean) {
  if (coverFirst && index === 0) return "Cover";
  return `Page ${coverFirst ? index : index + 1}`;
}

export function moveItem<T>(items: T[], from: number, dest: number): T[] {
  if (from < 0 || from >= items.length) return items.slice();
  const next = items.slice();
  const [item] = next.splice(from, 1);
  if (item === undefined) return items.slice();
  const at = Math.min(next.length, Math.max(0, dest));
  next.splice(at, 0, item);
  return next;
}
