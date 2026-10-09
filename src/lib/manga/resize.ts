import { clamp } from "@/lib/utils";
import type { LaidOutPanel, PanelRect, ResizeHandle } from "./types";

const EPS = 0.5;
const MIN_SIZE = 8;

export function rectsFromBoxes(boxes: LaidOutPanel[]): Record<string, PanelRect> {
  return Object.fromEntries(
    boxes.map((b) => [b.id, { x: b.x, y: b.y, w: b.w, h: b.h }]),
  );
}

export function roundRect(r: PanelRect): PanelRect {
  const n = (v: number) => Math.round(v * 100) / 100;
  return { x: n(r.x), y: n(r.y), w: n(r.w), h: n(r.h) };
}

function copyRects(rects: Record<string, PanelRect>): Record<string, PanelRect> {
  return Object.fromEntries(
    Object.entries(rects).map(([id, r]) => [id, { ...r }]),
  );
}

function moveVertical(
  rects: Record<string, PanelRect>,
  line: number,
  dx: number,
  opts: { margin: number; gutter: number; min: number },
): Record<string, PanelRect> {
  const { margin, gutter, min } = opts;
  const rightAt = (x: number, r: PanelRect) => Math.abs(r.x + r.w - x) < EPS;
  const leftAt = (x: number, r: PanelRect) => Math.abs(r.x - x) < EPS;

  const rights = new Set<string>();
  const lefts = new Set<string>();
  for (const [id, r] of Object.entries(rects)) {
    if (rightAt(line, r)) rights.add(id);
    if (leftAt(line, r)) lefts.add(id);
  }
  if (rights.size) {
    for (const [id, r] of Object.entries(rects)) {
      if (leftAt(line + gutter, r)) lefts.add(id);
    }
  }
  if (lefts.size) {
    for (const [id, r] of Object.entries(rects)) {
      if (rightAt(line - gutter, r)) rights.add(id);
    }
  }

  let minDx = Number.NEGATIVE_INFINITY;
  let maxDx = Number.POSITIVE_INFINITY;
  for (const id of rights) {
    const r = rects[id]!;
    minDx = Math.max(minDx, min - r.w);
    maxDx = Math.min(maxDx, 100 - margin - (r.x + r.w));
  }
  for (const id of lefts) {
    const r = rects[id]!;
    minDx = Math.max(minDx, margin - r.x);
    maxDx = Math.min(maxDx, r.w - min);
  }

  const d = clamp(dx, minDx, maxDx);
  const next = copyRects(rects);
  for (const id of rights) next[id]!.w += d;
  for (const id of lefts) {
    next[id]!.x += d;
    next[id]!.w -= d;
  }
  return next;
}

function moveHorizontal(
  rects: Record<string, PanelRect>,
  line: number,
  dy: number,
  opts: { margin: number; gutter: number; min: number },
): Record<string, PanelRect> {
  const { margin, gutter, min } = opts;
  const bottomAt = (y: number, r: PanelRect) => Math.abs(r.y + r.h - y) < EPS;
  const topAt = (y: number, r: PanelRect) => Math.abs(r.y - y) < EPS;

  const bottoms = new Set<string>();
  const tops = new Set<string>();
  for (const [id, r] of Object.entries(rects)) {
    if (bottomAt(line, r)) bottoms.add(id);
    if (topAt(line, r)) tops.add(id);
  }
  if (bottoms.size) {
    for (const [id, r] of Object.entries(rects)) {
      if (topAt(line + gutter, r)) tops.add(id);
    }
  }
  if (tops.size) {
    for (const [id, r] of Object.entries(rects)) {
      if (bottomAt(line - gutter, r)) bottoms.add(id);
    }
  }

  let minDy = Number.NEGATIVE_INFINITY;
  let maxDy = Number.POSITIVE_INFINITY;
  for (const id of bottoms) {
    const r = rects[id]!;
    minDy = Math.max(minDy, min - r.h);
    maxDy = Math.min(maxDy, 100 - margin - (r.y + r.h));
  }
  for (const id of tops) {
    const r = rects[id]!;
    minDy = Math.max(minDy, margin - r.y);
    maxDy = Math.min(maxDy, r.h - min);
  }

  const d = clamp(dy, minDy, maxDy);
  const next = copyRects(rects);
  for (const id of bottoms) next[id]!.h += d;
  for (const id of tops) {
    next[id]!.y += d;
    next[id]!.h -= d;
  }
  return next;
}

export function applyResize(
  start: Record<string, PanelRect>,
  panelId: string,
  handle: ResizeHandle,
  dx: number,
  dy: number,
  opts: { margin: number; gutter: number; min?: number },
): Record<string, PanelRect> {
  const box = start[panelId];
  if (!box) return start;
  const min = opts.min ?? MIN_SIZE;
  const moveE = handle === "e" || handle === "ne" || handle === "se";
  const moveW = handle === "w" || handle === "nw" || handle === "sw";
  const moveN = handle === "n" || handle === "ne" || handle === "nw";
  const moveS = handle === "s" || handle === "se" || handle === "sw";

  let { x, y, w, h } = box;
  if (moveE) w = clamp(box.w + dx, min, 99.6 - box.x);
  if (moveS) h = clamp(box.h + dy, min, 99.6 - box.y);
  if (moveW) {
    const nx = clamp(box.x + dx, 0.4, box.x + box.w - min);
    w = box.w + (box.x - nx);
    x = nx;
  }
  if (moveN) {
    const ny = clamp(box.y + dy, 0.4, box.y + box.h - min);
    h = box.h + (box.y - ny);
    y = ny;
  }
  const next = copyRects(start);
  next[panelId] = roundRect({ x, y, w, h });
  return next;
}

export function snapRectToNeighbors(
  rects: Record<string, PanelRect>,
  panelId: string,
  handle: ResizeHandle,
  threshold = 1.1,
): Record<string, PanelRect> {
  const box = rects[panelId];
  if (!box) return rects;
  const others = Object.entries(rects).filter(([id]) => id !== panelId);
  if (!others.length) return rects;
  const linesX = [0.4, 99.6];
  const linesY = [0.4, 99.6];
  for (const [, r] of others) {
    linesX.push(r.x, r.x + r.w);
    linesY.push(r.y, r.y + r.h);
  }
  const snapVal = (v: number, lines: number[]) => {
    let best = v;
    let dist = threshold;
    for (const line of lines) {
      const d = Math.abs(v - line);
      if (d < dist) {
        dist = d;
        best = line;
      }
    }
    return best;
  };
  let { x, y, w, h } = box;
  const moveE = handle.includes("e");
  const moveW = handle.includes("w");
  const moveN = handle.includes("n");
  const moveS = handle.includes("s");
  if (moveE) {
    const right = snapVal(x + w, linesX);
    w = Math.max(MIN_SIZE, right - x);
  }
  if (moveW) {
    const left = snapVal(x, linesX);
    w = Math.max(MIN_SIZE, x + w - left);
    x = left;
  }
  if (moveS) {
    const bottom = snapVal(y + h, linesY);
    h = Math.max(MIN_SIZE, bottom - y);
  }
  if (moveN) {
    const top = snapVal(y, linesY);
    h = Math.max(MIN_SIZE, y + h - top);
    y = top;
  }
  const next = copyRects(rects);
  next[panelId] = roundRect({ x, y, w, h });
  return next;
}

export type GutterRail = {
  id: string;
  axis: "x" | "y";
  line: number;
  mid: number;
  start: number;
  end: number;
};

export function collectGutterRails(
  boxes: { id: string; x: number; y: number; w: number; h: number }[],
  gutter: number,
): GutterRail[] {
  const rails: GutterRail[] = [];
  const slack = Math.max(0.35, gutter * 0.45);
  for (let i = 0; i < boxes.length; i++) {
    for (let j = 0; j < boxes.length; j++) {
      if (i === j) continue;
      const a = boxes[i]!;
      const b = boxes[j]!;
      const aRight = a.x + a.w;
      const gapX = b.x - aRight;
      if (gapX > 0.15 && Math.abs(gapX - gutter) < slack + 0.4) {
        const start = Math.max(a.y, b.y);
        const end = Math.min(a.y + a.h, b.y + b.h);
        if (end - start > 3) {
          rails.push({
            id: `x:${Math.round(aRight * 10)}:${Math.round(start * 10)}`,
            axis: "x",
            line: aRight,
            mid: aRight + gapX / 2,
            start,
            end,
          });
        }
      }
      const aBottom = a.y + a.h;
      const gapY = b.y - aBottom;
      if (gapY > 0.15 && Math.abs(gapY - gutter) < slack + 0.4) {
        const start = Math.max(a.x, b.x);
        const end = Math.min(a.x + a.w, b.x + b.w);
        if (end - start > 3) {
          rails.push({
            id: `y:${Math.round(aBottom * 10)}:${Math.round(start * 10)}`,
            axis: "y",
            line: aBottom,
            mid: aBottom + gapY / 2,
            start,
            end,
          });
        }
      }
    }
  }
  const seen = new Set<string>();
  return rails.filter((r) => {
    const key = `${r.axis}:${r.line.toFixed(1)}:${r.start.toFixed(1)}:${r.end.toFixed(1)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function applyRailMove(
  start: Record<string, PanelRect>,
  axis: "x" | "y",
  line: number,
  delta: number,
  opts: { margin: number; gutter: number; min?: number },
): Record<string, PanelRect> {
  const cfg = { margin: opts.margin, gutter: opts.gutter, min: opts.min ?? MIN_SIZE };
  return axis === "x"
    ? moveVertical(copyRects(start), line, delta, cfg)
    : moveHorizontal(copyRects(start), line, delta, cfg);
}

export type GutterCorner = {
  id: string;
  xLine: number;
  yLine: number;
  xMid: number;
  yMid: number;
};

export function collectGutterCorners(rails: GutterRail[]): GutterCorner[] {
  const verts = rails.filter((r) => r.axis === "x");
  const hors = rails.filter((r) => r.axis === "y");
  const corners: GutterCorner[] = [];
  const seen = new Set<string>();
  for (const v of verts) {
    for (const h of hors) {
      const onH = v.mid >= h.start - 1.5 && v.mid <= h.end + 1.5;
      const onV = h.mid >= v.start - 1.5 && h.mid <= v.end + 1.5;
      if (!onH || !onV) continue;
      const id = `c:${v.line.toFixed(1)}:${h.line.toFixed(1)}`;
      if (seen.has(id)) continue;
      seen.add(id);
      corners.push({
        id,
        xLine: v.line,
        yLine: h.line,
        xMid: v.mid,
        yMid: h.mid,
      });
    }
  }
  return corners;
}

export function applyCornerMove(
  start: Record<string, PanelRect>,
  xLine: number,
  yLine: number,
  dx: number,
  dy: number,
  opts: { margin: number; gutter: number; min?: number },
): Record<string, PanelRect> {
  const afterX = applyRailMove(start, "x", xLine, dx, opts);
  return applyRailMove(afterX, "y", yLine, dy, opts);
}

export function applyPanelMove(
  start: Record<string, PanelRect>,
  panelId: string,
  dx: number,
  dy: number,
  opts: { margin: number },
): Record<string, PanelRect> {
  const box = start[panelId];
  if (!box) return start;
  const next = copyRects(start);
  next[panelId] = roundRect({
    ...box,
    x: clamp(box.x + dx, 0.4, 100 - box.w - 0.4),
    y: clamp(box.y + dy, 0.4, 100 - box.h - 0.4),
  });
  return next;
}

/** Smallest panel whose original rect contains the page-percent point. */
export function hitPanelId(
  px: number,
  py: number,
  rects: Record<string, PanelRect>,
  ignoreId?: string | null,
): string | null {
  let best: string | null = null;
  let bestArea = Infinity;
  for (const [id, r] of Object.entries(rects)) {
    if (ignoreId && id === ignoreId) continue;
    if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) {
      const area = r.w * r.h;
      if (area < bestArea) {
        bestArea = area;
        best = id;
      }
    }
  }
  return best;
}

export function applySwapRects(
  start: Record<string, PanelRect>,
  a: string,
  b: string,
): Record<string, PanelRect> {
  const ra = start[a];
  const rb = start[b];
  if (!ra || !rb || a === b) return start;
  const next = copyRects(start);
  next[a] = { ...rb };
  next[b] = { ...ra };
  return next;
}

function uniqSorted(values: number[]): number[] {
  return [...new Set(values.map((v) => Math.round(v * 100) / 100))].sort(
    (a, b) => a - b,
  );
}

function collides(a: PanelRect, others: PanelRect[], gap: number): boolean {
  return others.some(
    (o) =>
      a.x < o.x + o.w + gap &&
      a.x + a.w > o.x - gap &&
      a.y < o.y + o.h + gap &&
      a.y + a.h > o.y - gap,
  );
}

function isAdjacent(a: PanelRect, b: PanelRect, slack: number): boolean {
  const overlapX =
    Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) > MIN_SIZE * 0.35;
  const overlapY =
    Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) > MIN_SIZE * 0.35;
  const touchX =
    Math.abs(a.x + a.w - b.x) < slack || Math.abs(b.x + b.w - a.x) < slack;
  const touchY =
    Math.abs(a.y + a.h - b.y) < slack || Math.abs(b.y + b.h - a.y) < slack;
  return (touchX && overlapY) || (touchY && overlapX);
}

/** Largest empty rectangle on the page that contains the point. */
export function emptySlotAt(
  px: number,
  py: number,
  obstacles: PanelRect[],
  opts: { margin: number; gutter: number },
): PanelRect | null {
  const m = opts.margin;
  const g = Math.max(0.35, opts.gutter);
  const left = m;
  const top = m;
  const right = 100 - m;
  const bottom = 100 - m;
  if (px < left || px > right || py < top || py > bottom) return null;
  if (
    obstacles.some(
      (o) => px >= o.x && px <= o.x + o.w && py >= o.y && py <= o.y + o.h,
    )
  ) {
    return null;
  }

  const xs = [left, right];
  const ys = [top, bottom];
  for (const o of obstacles) {
    xs.push(o.x, o.x + o.w, o.x - g, o.x + o.w + g);
    ys.push(o.y, o.y + o.h, o.y - g, o.y + o.h + g);
  }
  const X = uniqSorted(xs).filter((v) => v >= left - 0.01 && v <= right + 0.01);
  const Y = uniqSorted(ys).filter((v) => v >= top - 0.01 && v <= bottom + 0.01);

  let best: PanelRect | null = null;
  let bestArea = 0;
  for (let i = 0; i < X.length; i++) {
    for (let j = i + 1; j < X.length; j++) {
      const L = X[i]!;
      const R = X[j]!;
      if (px < L || px > R || R - L < MIN_SIZE) continue;
      for (let k = 0; k < Y.length; k++) {
        for (let t = k + 1; t < Y.length; t++) {
          const T = Y[k]!;
          const B = Y[t]!;
          if (py < T || py > B || B - T < MIN_SIZE) continue;
          const cand = { x: L, y: T, w: R - L, h: B - T };
          if (collides(cand, obstacles, g * 0.85)) continue;
          const area = cand.w * cand.h;
          if (area > bestArea) {
            bestArea = area;
            best = cand;
          }
        }
      }
    }
  }
  return best ? roundRect(best) : null;
}

export function expandIntoEmpty(
  panel: PanelRect,
  slot: PanelRect,
  others: PanelRect[],
  gutter: number,
): PanelRect {
  const g = Math.max(0.35, gutter);
  const x = Math.min(panel.x, slot.x);
  const y = Math.min(panel.y, slot.y);
  const r = Math.max(panel.x + panel.w, slot.x + slot.w);
  const b = Math.max(panel.y + panel.h, slot.y + slot.h);
  const grown = roundRect({ x, y, w: r - x, h: b - y });
  if (isAdjacent(panel, slot, g + 1.2) && !collides(grown, others, g * 0.5)) {
    return grown;
  }
  return roundRect(slot);
}

export function applyFillSlot(
  start: Record<string, PanelRect>,
  panelId: string,
  slot: PanelRect,
  gutter = 0.9,
): Record<string, PanelRect> {
  const next = copyRects(start);
  const panel = start[panelId];
  const others = Object.entries(start)
    .filter(([id]) => id !== panelId)
    .map(([, r]) => r);
  next[panelId] = panel
    ? expandIntoEmpty(panel, slot, others, gutter)
    : roundRect(slot);
  return next;
}

export const HANDLE_CURSOR: Record<ResizeHandle, string> = {
  n: "ns-resize",
  s: "ns-resize",
  e: "ew-resize",
  w: "ew-resize",
  ne: "nesw-resize",
  sw: "nesw-resize",
  nw: "nwse-resize",
  se: "nwse-resize",
};
