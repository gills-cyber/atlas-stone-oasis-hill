import type { GridSpec, LaidOutPanel, PageState, PanelRect } from "./types";

export type { GridSpec, LaidOutPanel };
export { PAGE_ASPECT, pageAspect, paperSpec, PAPER_SIZES } from "./paper";
export type { PaperSizeId } from "./paper";

export const TEMPLATES: GridSpec[] = [
  {
    id: "blank",
    name: "Blank",
    blurb: "Empty page — draw your own panels",
    rows: [],
    cols: [],
    cells: [],
  },
  {
    id: "splash",
    name: "Splash",
    blurb: "Full-page single panel",
    rows: [1],
    cols: [1],
    cells: [["a"]],
  },
  {
    id: "two-shot",
    name: "Two-shot",
    blurb: "Split page, equal weight",
    rows: [1, 1],
    cols: [1],
    cells: [["a"], ["b"]],
  },
  {
    id: "strips",
    name: "Strips",
    blurb: "Three widescreen bands",
    rows: [1, 1, 1],
    cols: [1],
    cells: [["a"], ["b"], ["c"]],
  },
  {
    id: "yonkoma",
    name: "Yon-koma",
    blurb: "Classic four-beat stack",
    rows: [1, 1, 1, 1],
    cols: [1],
    cells: [["a"], ["b"], ["c"], ["d"]],
  },
  {
    id: "triptych",
    name: "Triptych",
    blurb: "Three vertical columns",
    rows: [1],
    cols: [1, 1, 1],
    cells: [["a", "b", "c"]],
  },
  {
    id: "six",
    name: "Six grid",
    blurb: "Even 2 × 3 page",
    rows: [1, 1, 1],
    cols: [1, 1],
    cells: [
      ["a", "b"],
      ["c", "d"],
      ["e", "f"],
    ],
  },
  {
    id: "establishing",
    name: "Establishing",
    blurb: "Wide opener, four follow-ups",
    rows: [1.2, 1, 1],
    cols: [1, 1],
    cells: [
      ["a", "a"],
      ["b", "c"],
      ["d", "e"],
    ],
  },
  {
    id: "tower",
    name: "Tower",
    blurb: "Tall lead, stacked replies",
    rows: [1, 1, 1],
    cols: [1.4, 1],
    cells: [
      ["a", "b"],
      ["a", "c"],
      ["a", "d"],
    ],
  },
  {
    id: "gutter-right",
    name: "Gutter right",
    blurb: "Tall panel on the right",
    rows: [1, 1, 1],
    cols: [1, 1.4],
    cells: [
      ["b", "a"],
      ["c", "a"],
      ["d", "a"],
    ],
  },
  {
    id: "spotlight",
    name: "Spotlight",
    blurb: "Hero frame over a three-shot",
    rows: [1.7, 1],
    cols: [1, 1, 1],
    cells: [
      ["a", "a", "a"],
      ["b", "c", "d"],
    ],
  },
  {
    id: "l-cut",
    name: "L-cut",
    blurb: "Big opener, then a kick",
    rows: [1.15, 1, 1],
    cols: [1.25, 1],
    cells: [
      ["a", "a"],
      ["a", "b"],
      ["c", "d"],
    ],
  },
  {
    id: "offset",
    name: "Offset",
    blurb: "Uneven columns, shifting rhythm",
    rows: [1.1, 0.85, 1.2],
    cols: [1.35, 1],
    cells: [
      ["a", "b"],
      ["c", "c"],
      ["d", "e"],
    ],
  },
  {
    id: "dense",
    name: "Dense",
    blurb: "Eight-panel chapter page",
    rows: [1, 1, 1, 1],
    cols: [1, 1],
    cells: [
      ["a", "b"],
      ["c", "d"],
      ["e", "f"],
      ["g", "h"],
    ],
  },
  {
    id: "brochure-cover",
    name: "Cover",
    blurb: "Header, photo, contact bar",
    group: "brochure",
    rows: [0.28, 1.15, 0.3],
    cols: [1],
    cells: [["h"], ["a"], ["f"]],
  },
  {
    id: "brochure-tri",
    name: "Tri-fold",
    blurb: "Three brochure panels",
    group: "brochure",
    rows: [1],
    cols: [1, 1, 1],
    cells: [["a", "b", "c"]],
  },
  {
    id: "brochure-services",
    name: "Services",
    blurb: "Banner plus three cards",
    group: "brochure",
    rows: [0.36, 1],
    cols: [1, 1, 1],
    cells: [
      ["h", "h", "h"],
      ["a", "b", "c"],
    ],
  },
  {
    id: "brochure-split",
    name: "Kids & adults",
    blurb: "Two columns under a banner",
    group: "brochure",
    rows: [0.28, 1],
    cols: [1, 1],
    cells: [
      ["h", "h"],
      ["a", "b"],
    ],
  },
  {
    id: "brochure-team",
    name: "Team",
    blurb: "Banner and four portraits",
    group: "brochure",
    rows: [0.26, 1, 1],
    cols: [1, 1],
    cells: [
      ["h", "h"],
      ["a", "b"],
      ["c", "d"],
    ],
  },
  {
    id: "brochure-flyer",
    name: "Flyer",
    blurb: "Hero, two features, footer",
    group: "brochure",
    rows: [0.95, 0.55, 0.3],
    cols: [1, 1],
    cells: [
      ["a", "a"],
      ["b", "c"],
      ["f", "f"],
    ],
  },
  {
    id: "brochure-letter",
    name: "Letterhead",
    blurb: "Brand bar and body",
    group: "brochure",
    rows: [0.18, 1],
    cols: [1],
    cells: [["h"], ["a"]],
  },
  {
    id: "brochure-hours",
    name: "Visit us",
    blurb: "Intro, photo, hours",
    group: "brochure",
    rows: [0.26, 1, 0.38],
    cols: [1, 1],
    cells: [
      ["h", "h"],
      ["a", "b"],
      ["f", "f"],
    ],
  },
];

export function getTemplate(id: string): GridSpec {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES.find((t) => t.id === "six") ?? TEMPLATES[0]!;
}

export function panelIds(spec: GridSpec): string[] {
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const row of spec.cells) {
    for (const id of row) {
      if (!seen.has(id)) {
        seen.add(id);
        ids.push(id);
      }
    }
  }
  return ids;
}

export function readingOrder(spec: GridSpec, rtl: boolean): string[] {
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const row of spec.cells) {
    const seq = rtl ? [...row].reverse() : row;
    for (const id of seq) {
      if (!seen.has(id)) {
        seen.add(id);
        ids.push(id);
      }
    }
  }
  return ids;
}

export function layoutTemplate(
  spec: GridSpec,
  margin: number,
  gutter: number,
  rtl: boolean,
): LaidOutPanel[] {
  const nR = spec.rows.length;
  const nC = spec.cols.length;
  const sumR = spec.rows.reduce((a, b) => a + b, 0);
  const sumC = spec.cols.reduce((a, b) => a + b, 0);
  if (nR === 0 || nC === 0 || sumR === 0 || sumC === 0) return [];
  const innerW = 100 - margin * 2;
  const innerH = 100 - margin * 2;
  const gapW = nC > 1 ? gutter * (nC - 1) : 0;
  const gapH = nR > 1 ? gutter * (nR - 1) : 0;
  const usableW = innerW - gapW;
  const usableH = innerH - gapH;

  const colX: number[] = [];
  const colW: number[] = [];
  let x = margin;
  for (let i = 0; i < nC; i++) {
    const w = (spec.cols[i]! / sumC) * usableW;
    colX.push(x);
    colW.push(w);
    x += w + gutter;
  }

  const rowY: number[] = [];
  const rowH: number[] = [];
  let y = margin;
  for (let i = 0; i < nR; i++) {
    const h = (spec.rows[i]! / sumR) * usableH;
    rowY.push(y);
    rowH.push(h);
    y += h + gutter;
  }

  type Box = { r0: number; r1: number; c0: number; c1: number };
  const boxes = new Map<string, Box>();
  for (let r = 0; r < nR; r++) {
    const row = spec.cells[r] ?? [];
    for (let c = 0; c < nC; c++) {
      const id = row[c];
      if (!id) continue;
      const prev = boxes.get(id);
      if (!prev) {
        boxes.set(id, { r0: r, r1: r, c0: c, c1: c });
      } else {
        prev.r0 = Math.min(prev.r0, r);
        prev.r1 = Math.max(prev.r1, r);
        prev.c0 = Math.min(prev.c0, c);
        prev.c1 = Math.max(prev.c1, c);
      }
    }
  }

  const order = readingOrder(spec, rtl);
  const indexOf = new Map(order.map((id, i) => [id, i + 1]));

  const panels: LaidOutPanel[] = [];
  for (const [id, box] of boxes) {
    panels.push({
      id,
      x: colX[box.c0]!,
      y: rowY[box.r0]!,
      w: colX[box.c1]! + colW[box.c1]! - colX[box.c0]!,
      h: rowY[box.r1]! + rowH[box.r1]! - rowY[box.r0]!,
      index: indexOf.get(id) ?? 0,
    });
  }

  panels.sort((a, b) => a.index - b.index);
  return panels;
}

export function boxesForPage(
  page: Pick<PageState, "templateId" | "panels">,
  margin: number,
  gutter: number,
  rtl: boolean,
): LaidOutPanel[] {
  const spec = getTemplate(page.templateId);
  const base = layoutTemplate(spec, margin, gutter, rtl);
  const baseById = new Map(base.map((b) => [b.id, b]));
  return page.panels.map((p, i) => {
    if (p.rect) {
      return { id: p.id, ...p.rect, index: i + 1 };
    }
    const fromTemplate = baseById.get(p.id);
    if (fromTemplate) return { ...fromTemplate, index: i + 1 };
    return { id: p.id, x: 12, y: 12 + (i % 4) * 6, w: 40, h: 28, index: i + 1 };
  });
}
