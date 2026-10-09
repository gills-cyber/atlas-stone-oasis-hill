import type { PanelImage } from "./types";
import { clamp } from "@/lib/utils";

const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.84;

/** Small enough that a huge photo still fits inside a tiny panel. */
export const IMAGE_ZOOM_MIN = 0.02;
export const IMAGE_ZOOM_MAX = 4;

export function clampImageZoom(z: number) {
  return clamp(z, IMAGE_ZOOM_MIN, IMAGE_ZOOM_MAX);
}

export function freshImage(src: string, extra?: Partial<PanelImage>): PanelImage {
  return {
    src,
    zoom: 1,
    focusX: 50,
    focusY: 50,
    fit: "cover",
    brightness: 100,
    contrast: 100,
    rotate: 0,
    flipX: false,
    flipY: false,
    ...extra,
  };
}

export function imageFilter(image: {
  brightness?: number;
  contrast?: number;
}): string {
  const b = (image.brightness ?? 100) / 100;
  const c = (image.contrast ?? 100) / 100;
  return `brightness(${b}) contrast(${c})`;
}

export function tiltCover(deg = 0, aspect = 1) {
  const r = ((deg % 180) * Math.PI) / 180;
  const s = Math.abs(Math.sin(r));
  const c = Math.abs(Math.cos(r));
  const a = aspect > 0 ? aspect : 1;
  return Math.max(c + s / a, s * a + c) || 1;
}

export function imageTransform(image: {
  zoom: number;
  focusX: number;
  focusY: number;
  rotate?: number;
  flipX?: boolean;
  flipY?: boolean;
}): string {
  const sx = (image.flipX ? -1 : 1) * image.zoom;
  const sy = (image.flipY ? -1 : 1) * image.zoom;
  const rot = image.rotate ?? 0;
  return `translate(0, 0) rotate(${rot}deg) scale(${sx}, ${sy})`;
}

/** Layout matching drawFitted, as % of the panel. Null until intrinsic size is known. */
export function fittedImageCss(
  imgW: number,
  imgH: number,
  panelAspect: number,
  fit: "cover" | "contain",
  zoom: number,
  focusX: number,
  focusY: number,
): { width: string; height: string; left: string; top: string } | null {
  if (!(imgW > 0 && imgH > 0 && panelAspect > 0)) return null;
  const ir = imgW / imgH;
  const pr = panelAspect;
  const z = clampImageZoom(zoom);
  let widthPct: number;
  let heightPct: number;
  if (fit === "cover") {
    if (ir > pr) {
      heightPct = 100 * z;
      widthPct = heightPct * (ir / pr);
    } else {
      widthPct = 100 * z;
      heightPct = widthPct * (pr / ir);
    }
  } else if (ir > pr) {
    widthPct = 100 * z;
    heightPct = widthPct * (pr / ir);
  } else {
    heightPct = 100 * z;
    widthPct = heightPct * (ir / pr);
  }
  const left = 50 + ((50 - focusX) / 100) * (widthPct - 100) - widthPct / 2;
  const top = 50 + ((50 - focusY) / 100) * (heightPct - 100) - heightPct / 2;
  return {
    width: `${widthPct}%`,
    height: `${heightPct}%`,
    left: `${left}%`,
    top: `${top}%`,
  };
}

export function imageFlipRotate(image: {
  rotate?: number;
  flipX?: boolean;
  flipY?: boolean;
}): string {
  const sx = image.flipX ? -1 : 1;
  const sy = image.flipY ? -1 : 1;
  const rot = image.rotate ?? 0;
  return `rotate(${rot}deg) scale(${sx}, ${sy})`;
}

export function isImageFile(file: File) {
  const mime = file.type;
  const named =
    /\.(png|jpe?g|webp|gif|heic|heif|avif|bmp|tif{1,2}|jfif|svg)$/i.test(
      file.name,
    );
  if (mime.startsWith("image/")) return true;
  if (mime === "application/octet-stream" || mime === "") return named;
  return named;
}

async function rasterize(
  source: CanvasImageSource,
  width: number,
  height: number,
): Promise<string> {
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Could not read image");
  ctx.drawImage(source, 0, 0, w, h);
  if (canvasHasAlpha(ctx, w, h)) return canvas.toDataURL("image/png");
  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

function canvasHasAlpha(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  try {
    const data = ctx.getImageData(0, 0, width, height).data;
    for (let i = 3; i < data.length; i += 16) {
      if ((data[i] ?? 255) < 250) return true;
    }
  } catch {
    return false;
  }
  return false;
}

export function srcLooksCutout(src: string) {
  return src.startsWith("data:image/png") || src.startsWith("blob:");
}

function fileViaImageElement(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      void rasterize(img, img.naturalWidth, img.naturalHeight)
        .then(resolve)
        .catch(reject)
        .finally(() => URL.revokeObjectURL(url));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}

export async function fileToPanelSrc(file: File): Promise<string> {
  if (!isImageFile(file)) {
    throw new Error("That file is not an image");
  }
  try {
    const bitmap = await createImageBitmap(file);
    try {
      return await rasterize(bitmap, bitmap.width, bitmap.height);
    } finally {
      bitmap.close();
    }
  } catch {
    return fileViaImageElement(file);
  }
}

export async function fileToStickerSrc(file: File, maxEdge = 512): Promise<string> {
  if (!isImageFile(file)) {
    throw new Error("That file is not an image");
  }
  const MAX = maxEdge;
  async function toPng(source: CanvasImageSource, width: number, height: number) {
    const scale = Math.min(1, MAX / Math.max(width, height));
    const w = Math.max(1, Math.round(width * scale));
    const h = Math.max(1, Math.round(height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not read image");
    ctx.drawImage(source, 0, 0, w, h);
    return canvas.toDataURL("image/png");
  }
  try {
    const bitmap = await createImageBitmap(file);
    try {
      return await toPng(bitmap, bitmap.width, bitmap.height);
    } finally {
      bitmap.close();
    }
  } catch {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        void toPng(img, img.naturalWidth, img.naturalHeight)
          .then(resolve)
          .catch(reject)
          .finally(() => URL.revokeObjectURL(url));
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Could not read image"));
      };
      img.src = url;
    });
  }
}

export async function fileToLogoSrc(file: File): Promise<string> {
  if (file.type === "image/svg+xml" || /\.svg$/i.test(file.name)) {
    const text = await file.text();
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(text)}`;
  }
  return fileToStickerSrc(file, 1024);
}

export function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!src.startsWith("data:") && !src.startsWith("blob:")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = src;
  });
}

export function drawFitted(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  imgW: number,
  imgH: number,
  x: number,
  y: number,
  w: number,
  h: number,
  fit: "cover" | "contain",
  zoom: number,
  focusX: number,
  focusY: number,
  filter?: string,
  rotate = 0,
  flipX = false,
  flipY = false,
) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  if (filter) ctx.filter = filter;

  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate((rotate * Math.PI) / 180);
  ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);

  const ir = imgW / imgH;
  const pr = w / h;
  const z = clampImageZoom(zoom);
  let dw: number;
  let dh: number;
  if (fit === "cover") {
    if (ir > pr) {
      dh = h * z;
      dw = dh * ir;
    } else {
      dw = w * z;
      dh = dw / ir;
    }
  } else if (ir > pr) {
    dw = w * z;
    dh = dw / ir;
  } else {
    dh = h * z;
    dw = dh * ir;
  }

  const ox = -dw / 2 + ((50 - focusX) / 100) * (dw - w);
  const oy = -dh / 2 + ((50 - focusY) / 100) * (dh - h);
  ctx.drawImage(img, ox, oy, dw, dh);
  ctx.restore();
}
