import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  folioToPageIndex,
  insertIndexFromMidpoints,
  labelForIndex,
  moveItem,
  parseSendTo,
} from "./page-order.ts";

describe("insertIndexFromMidpoints", () => {
  it("inserts before the first page when clicking above it", () => {
    assert.equal(insertIndexFromMidpoints([40, 120, 200], 10), 0);
  });

  it("inserts between 3 and 4 when clicking below page 3's midpoint", () => {
    // pages at mid 50, 150, 250, 350 → page 3 mid 250, page 4 mid 350
    assert.equal(insertIndexFromMidpoints([50, 150, 250, 350], 300), 3);
  });

  it("appends when clicking past the last page", () => {
    assert.equal(insertIndexFromMidpoints([50, 150, 250], 400), 3);
  });
});

describe("send-to order", () => {
  it("parses cover aliases and page numbers", () => {
    assert.equal(parseSendTo("cover"), "cover");
    assert.equal(parseSendTo("  C "), "cover");
    assert.equal(parseSendTo("0"), "cover");
    assert.equal(parseSendTo("7"), 7);
    assert.equal(parseSendTo(""), null);
    assert.equal(parseSendTo("nope"), null);
  });

  it("maps folio 7 to index 7 when the first page is a cover", () => {
    assert.equal(folioToPageIndex(7, 9, true), 7);
  });

  it("maps folio 7 to index 6 without a cover", () => {
    assert.equal(folioToPageIndex(7, 9, false), 6);
  });

  it("moves page 5 to position 7 and shifts the rest", () => {
    const pages = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    assert.deepEqual(moveItem(pages, 5, 7), [0, 1, 2, 3, 4, 6, 7, 5, 8]);
  });

  it("moves a later page earlier", () => {
    const pages = [0, 1, 2, 3, 4, 5, 6, 7];
    assert.deepEqual(moveItem(pages, 7, 3), [0, 1, 2, 7, 3, 4, 5, 6]);
  });

  it("labels insert-at-4 as Page 4 when cover is first", () => {
    assert.equal(labelForIndex(4, true), "Page 4");
    assert.equal(labelForIndex(0, true), "Cover");
    assert.equal(labelForIndex(3, false), "Page 4");
  });
});
