import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  describeWebtoonExport,
  packVerticalCuts,
  tileHeight,
  WEBTOON_CUT_HEIGHT,
  WEBTOON_SAFE_EDGE,
  WEBTOON_WIDTH,
} from "./webtoon.ts";

describe("packVerticalCuts", () => {
  it("keeps short pages in one strip tile", () => {
    const tiles = packVerticalCuts([1280, 1280, 1280], WEBTOON_SAFE_EDGE);
    assert.equal(tiles.length, 1);
    assert.equal(tileHeight(tiles[0]!), 3840);
    assert.deepEqual(tiles[0], [
      { src: 0, sy: 0, sh: 1280 },
      { src: 1, sy: 0, sh: 1280 },
      { src: 2, sy: 0, sh: 1280 },
    ]);
  });

  it("emits one cut per page at Canvas height", () => {
    const tiles = packVerticalCuts([1280, 1280, 900], WEBTOON_CUT_HEIGHT);
    assert.equal(tiles.length, 3);
    assert.deepEqual(tiles[2], [{ src: 2, sy: 0, sh: 900 }]);
  });

  it("splits a page that is taller than the cap", () => {
    const tiles = packVerticalCuts([2000], 1280);
    assert.deepEqual(tiles, [
      [{ src: 0, sy: 0, sh: 1280 }],
      [{ src: 0, sy: 1280, sh: 720 }],
    ]);
  });

  it("splits a long strip across the browser-safe edge", () => {
    const pages = Array.from({ length: 10 }, () => WEBTOON_CUT_HEIGHT);
    const tiles = packVerticalCuts(pages, WEBTOON_SAFE_EDGE);
    assert.ok(tiles.length >= 2);
    for (const tile of tiles) {
      assert.ok(tileHeight(tile) <= WEBTOON_SAFE_EDGE);
    }
    const total = tiles.reduce((n, t) => n + tileHeight(t), 0);
    assert.equal(total, 10 * WEBTOON_CUT_HEIGHT);
  });

  it("returns no tiles for empty input", () => {
    assert.deepEqual(packVerticalCuts([], 1280), []);
  });
});

describe("describeWebtoonExport", () => {
  it("sizes a webtoon page at 800 × 1280", () => {
    const d = describeWebtoonExport(2, WEBTOON_CUT_HEIGHT);
    assert.equal(d.pageHeight, 1280);
    assert.equal(d.stripHeight, 2560);
    assert.equal(d.stripFiles, 1);
    assert.equal(d.canvasCuts, 2);
  });

  it("splits a long A4 episode into multiple strip files", () => {
    const pageH = Math.round(WEBTOON_WIDTH * (297 / 210));
    const d = describeWebtoonExport(12, pageH);
    assert.equal(d.pageHeight, pageH);
    assert.ok(d.stripFiles >= 2);
    assert.equal(d.canvasCuts, 12);
  });
});
