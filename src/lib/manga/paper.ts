import type { BalloonStyle } from "./types";

export type PaperSizeId = "b5" | "a4" | "a5" | "letter" | "webtoon";

export const PAPER_SIZES: {
  id: PaperSizeId;
  label: string;
  blurb: string;
  w: number;
  h: number;
}[] = [
  { id: "b5", label: "B5", blurb: "Tankōbon", w: 182, h: 257 },
  { id: "a4", label: "A4", blurb: "Print draft", w: 210, h: 297 },
  { id: "a5", label: "A5", blurb: "Small digest", w: 148, h: 210 },
  { id: "letter", label: "Letter", blurb: "US letter", w: 216, h: 279 },
  { id: "webtoon", label: "Webtoon", blurb: "Tall scroll", w: 800, h: 1280 },
];

export const DEFAULT_PAPER_SIZE: PaperSizeId = "a4";

export function paperSpec(id: PaperSizeId = DEFAULT_PAPER_SIZE) {
  return PAPER_SIZES.find((s) => s.id === id) ?? PAPER_SIZES[1]!;
}

export function pageAspect(id: PaperSizeId = DEFAULT_PAPER_SIZE) {
  const s = paperSpec(id);
  return s.w / s.h;
}

/** @deprecated use pageAspect(paperSize) */
export const PAGE_ASPECT = 210 / 297;

export type OverlayStyle = {
  fontSize: number;
  bold: boolean;
  italic: boolean;
  color: string;
  fill?: string;
  stroke?: string;
  vertical?: boolean;
  rotate?: number;
  opacity?: number;
  fontId?: string;
  align?: "left" | "center" | "right";
  balloonStyle?: BalloonStyle;
};
