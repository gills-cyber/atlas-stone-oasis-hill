import { clinicIconSrc } from "./clinic-icons";
import { layoutTemplate, getTemplate } from "./templates";
import type { Overlay, PageState } from "./types";
import { uid } from "@/lib/utils";

function ov(partial: Omit<Overlay, "id" | "tailX" | "tailY" | "fill" | "stroke" | "bold" | "italic" | "color"> & Partial<Overlay>): Overlay {
  return {
    id: uid("ov"),
    fill: "transparent",
    stroke: "transparent",
    tailX: 50,
    tailY: 120,
    bold: false,
    italic: false,
    color: "#2C4454",
    ...partial,
  };
}

export const BROCHURE_TEMPLATE = "brochure-services";

export function brochureOverlays(): Overlay[] {
  return [
    ov({
      kind: "title",
      x: 8,
      y: 4.2,
      w: 84,
      h: 10,
      text: "Your Clinic Name",
      fontSize: 34,
      bold: true,
      fontId: "playfair",
      align: "center",
      color: "#2C4454",
    }),
    ov({
      kind: "text",
      x: 12,
      y: 14.5,
      w: 76,
      h: 7,
      text: "Neuropsychological testing & therapy for kids and adults",
      fontSize: 15,
      fontId: "lora",
      align: "center",
      color: "#2F8F85",
      italic: true,
    }),
    ov({
      kind: "sticker",
      x: 10,
      y: 32,
      w: 16,
      h: 16,
      text: "",
      fontSize: 16,
      src: clinicIconSrc("testing"),
      color: "",
    }),
    ov({
      kind: "text",
      x: 6,
      y: 50,
      w: 26,
      h: 16,
      text: "Testing\nCognitive, ADHD, and learning evaluations.",
      fontSize: 14,
      fontId: "outfit",
      align: "center",
      bold: true,
    }),
    ov({
      kind: "sticker",
      x: 42,
      y: 32,
      w: 16,
      h: 16,
      text: "",
      fontSize: 16,
      src: clinicIconSrc("kids"),
      color: "",
    }),
    ov({
      kind: "text",
      x: 37,
      y: 50,
      w: 26,
      h: 16,
      text: "Kids\nPlayful therapy that meets children where they are.",
      fontSize: 14,
      fontId: "outfit",
      align: "center",
      bold: true,
    }),
    ov({
      kind: "sticker",
      x: 74,
      y: 32,
      w: 16,
      h: 16,
      text: "",
      fontSize: 16,
      src: clinicIconSrc("adults"),
      color: "",
    }),
    ov({
      kind: "text",
      x: 68,
      y: 50,
      w: 26,
      h: 16,
      text: "Adults\nAssessment and care across the lifespan.",
      fontSize: 14,
      fontId: "outfit",
      align: "center",
      bold: true,
    }),
    ov({
      kind: "text",
      x: 8,
      y: 88,
      w: 84,
      h: 8,
      text: "Call  ·  Visit  ·  Book a consult",
      fontSize: 14,
      fontId: "karla",
      align: "center",
      color: "#2F8F85",
    }),
  ];
}

export function makeBrochurePage(): PageState {
  const spec = getTemplate(BROCHURE_TEMPLATE);
  const laid = layoutTemplate(spec, 5, 1.8, false);
  return {
    id: uid("page"),
    title: "Clinic brochure",
    templateId: spec.id,
    overlays: brochureOverlays(),
    panels: laid.map((b) => ({
      id: b.id,
      image: null,
      rect: { x: b.x, y: b.y, w: b.w, h: b.h },
    })),
  };
}
