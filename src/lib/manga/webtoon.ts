/** WEBTOON Canvas requires 800px-wide RGB images. */
export const WEBTOON_WIDTH = 800;
/** Recommended cut height on WEBTOON Canvas (one phone screen). */
export const WEBTOON_CUT_HEIGHT = 1280;
/** Canvas rejects cuts shorter than this. */
export const WEBTOON_MIN_CUT = 400;
/** Canvas max height per image. */
export const WEBTOON_MAX_CUT = 20_000;
/**
 * Browser canvases (especially iOS) fail past ~8k on an edge. Split strips
 * before we hit that, even though Canvas itself allows 20k.
 */
export const WEBTOON_SAFE_EDGE = 8192;

export type WebtoonBlit = {
  src: number;
  sy: number;
  sh: number;
};

/** Pack source image heights into output tiles that never exceed maxHeight. */
export function packVerticalCuts(
  heights: number[],
  maxHeight: number,
): WebtoonBlit[][] {
  const cap = Math.max(1, Math.floor(maxHeight));
  const tiles: WebtoonBlit[][] = [];
  let tile: WebtoonBlit[] = [];
  let used = 0;
  for (let i = 0; i < heights.length; i++) {
    const full = Math.max(0, Math.round(heights[i] ?? 0));
    let remaining = full;
    let sy = 0;
    while (remaining > 0) {
      if (used >= cap) {
        if (tile.length) tiles.push(tile);
        tile = [];
        used = 0;
      }
      const sh = Math.min(cap - used, remaining);
      tile.push({ src: i, sy, sh });
      used += sh;
      sy += sh;
      remaining -= sh;
    }
  }
  if (tile.length) tiles.push(tile);
  return tiles;
}

export function tileHeight(blits: WebtoonBlit[], minHeight = 0) {
  const h = blits.reduce((sum, b) => sum + b.sh, 0);
  return Math.max(minHeight, h);
}

export function describeWebtoonExport(pageCount: number, pageHeight: number) {
  const n = Math.max(0, Math.floor(pageCount));
  const h = Math.max(0, Math.round(pageHeight));
  const heights = Array.from({ length: n }, () => h);
  const stripTiles = packVerticalCuts(
    heights,
    Math.min(WEBTOON_SAFE_EDGE, WEBTOON_MAX_CUT),
  );
  return {
    pageCount: n,
    pageHeight: h,
    stripHeight: h * n,
    stripFiles: n === 0 ? 0 : Math.max(1, stripTiles.length),
    canvasCuts: n,
  };
}
