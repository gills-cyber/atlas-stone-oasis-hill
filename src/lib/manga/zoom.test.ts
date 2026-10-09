import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { nudgeZoom, pageCssWidth, stepZoom, zoomLabel } from "./zoom.ts";

describe("page zoom", () => {
  it("steps from fit into 100, then up through presets", () => {
    assert.equal(stepZoom("fit", 1), 100);
    assert.equal(stepZoom(100, 1), 125);
    assert.equal(stepZoom(150, 1), 200);
    assert.equal(stepZoom(400, 1), 400);
  });

  it("steps down to fit", () => {
    assert.equal(stepZoom(100, -1), 75);
    assert.equal(stepZoom(50, -1), "fit");
    assert.equal(stepZoom("fit", -1), "fit");
  });

  it("nudges in 5% increments and labels percent", () => {
    assert.equal(nudgeZoom(100, 12), 110);
    assert.equal(nudgeZoom("fit", -12), 90);
    assert.equal(zoomLabel(200), "200%");
    assert.equal(zoomLabel("fit"), "Fit");
    assert.equal(pageCssWidth(100), "560px");
    assert.equal(pageCssWidth("fit"), "100%");
  });
});
