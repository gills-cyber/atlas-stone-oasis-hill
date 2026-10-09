import { describe, expect, it } from "vitest";
import { letterLockHeight, letterPixelSize } from "./lettering";

describe("letterPixelSize", () => {
  it("stays the same if the balloon grows", () => {
    const o = { kind: "speech" as const, fontSize: 15 };
    const pageH = 800;
    const a = letterPixelSize(o, pageH);
    const b = letterPixelSize({ ...o, fontSize: 15 }, pageH);
    expect(a).toBeCloseTo(15 * ((pageH * letterLockHeight("speech")) / 100) / 110, 5);
    expect(b).toBe(a);
  });

  it("scales with the page, not a live overlay height", () => {
    const o = { kind: "speech" as const, fontSize: 15 };
    const small = letterPixelSize(o, 400);
    const large = letterPixelSize(o, 800);
    expect(large / small).toBeCloseTo(2, 5);
  });
});
