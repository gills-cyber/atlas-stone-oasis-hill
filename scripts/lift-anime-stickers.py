#!/usr/bin/env python3
"""Lift 4K anime stickers off black plates to transparent PNG + WebP."""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path("/workspace/artifacts/imagine_images")
DEST = Path("/workspace/public/stickers/anime")

# source filename → sticker id
MAP: dict[str, str] = {
    "61be0e43-613d-4376-a9fe-726842039776.jpg": "steam",
    "547cd111-ce82-4f91-80a9-76df42d53fb7.jpg": "wisps",
    "e45cd234-5225-4f77-b6c2-3ce0588cacb9.jpg": "fog",
    "f201db1e-1855-41a7-bda4-22e073579f1d.jpg": "breath",
    "b033c4ad-e735-4f9d-87ed-90766d548406.jpg": "smoke",
    "896269f6-8eed-4492-b24d-661ac3154702.jpg": "sparkle",
    "d3026bb2-7fdc-4f4b-ac5a-a8acbe46188c.jpg": "heart",
    "6f5f2d05-d5bb-4d2c-a1d6-7ce8bcfe9e0f.jpg": "blush",
    "0c725c75-6e43-4043-bb5e-b8e8bf9acfac.jpg": "sweat",
    "3a6b3284-2f11-49a4-a2c8-3bb83413da09.jpg": "tear",
    "a5e60085-4807-4fba-ba1d-6db139022180.jpg": "vein",
    "a37f50e9-83b3-4e3c-914f-c21154d97c26.jpg": "petals",
    "5cdafe69-e3f6-4ba8-a03a-adfefaf08e98.jpg": "impact",
    "92e3a245-5e64-4b3f-a33f-32bec3da6f14.jpg": "aura",
    "1f96ec06-ccba-4d35-b269-3d8b763ee8ce.jpg": "glint",
    "d455a29a-2a41-4784-9a82-84d009c6b670.jpg": "zzz",
    "ba8ad979-0dcf-41fb-a5fd-700624f4bef0.jpg": "notes",
    "ff56a54b-245e-4b61-b50e-75b0d95c2e1a.jpg": "shock",
    "d5c82fbc-768f-4154-a506-97b26d6c7a75.jpg": "chill",
    "e0611fa9-748a-42f6-afb3-3b7125a73e53.jpg": "flower",
}

# Extra-soft plates (steam / fog) keep fainter wisps.
SOFT = {"steam", "wisps", "fog", "breath", "smoke", "chill", "aura", "shock"}


def lift(arr: np.ndarray, soft: bool) -> np.ndarray:
    rgb = arr[:, :, :3].astype(np.float32)
    r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    luma = 0.2126 * r + 0.7152 * g + 0.0722 * b
    chroma = rgb.max(axis=2) - rgb.min(axis=2)
    score = np.maximum(luma, chroma * 1.25)
    if soft:
        alpha = np.clip((score - 4.0) / 36.0, 0.0, 1.0)
        alpha = np.power(alpha, 0.72)
    else:
        alpha = np.clip((score - 10.0) / 48.0, 0.0, 1.0)
        alpha = np.power(alpha, 0.88)
    out = np.empty((*arr.shape[:2], 4), dtype=np.float32)
    out[:, :, :3] = rgb
    out[:, :, 3] = alpha * 255.0
    return np.clip(out, 0, 255).astype(np.uint8)


def crop(arr: np.ndarray, pad: int = 18) -> np.ndarray:
    a = arr[:, :, 3]
    ys, xs = np.where(a > 8)
    if len(xs) == 0:
        return arr
    x0, x1 = int(xs.min()), int(xs.max())
    y0, y1 = int(ys.min()), int(ys.max())
    x0 = max(0, x0 - pad)
    y0 = max(0, y0 - pad)
    x1 = min(arr.shape[1] - 1, x1 + pad)
    y1 = min(arr.shape[0] - 1, y1 + pad)
    return arr[y0 : y1 + 1, x0 : x1 + 1]


def upscale(im: Image.Image, max_side: int = 2048) -> Image.Image:
    w, h = im.size
    long = max(w, h)
    if long >= max_side:
        return im
    scale = max_side / long
    nw, nh = int(round(w * scale)), int(round(h * scale))
    return im.resize((nw, nh), Image.Resampling.LANCZOS)


def process(src: Path, name: str) -> None:
    im = Image.open(src).convert("RGBA")
    arr = lift(np.asarray(im), name in SOFT)
    arr = crop(arr)
    out = upscale(Image.fromarray(arr, "RGBA"), 2048)
    DEST.mkdir(parents=True, exist_ok=True)
    png = DEST / f"{name}.png"
    webp = DEST / f"{name}.webp"
    out.save(png, "PNG", optimize=True)
    try:
        out.save(webp, "WEBP", lossless=True, quality=90, method=6)
    except OSError:
        out.save(webp, "WEBP", quality=92, method=6)
    print(f"{name}: {out.size[0]}x{out.size[1]}  png={png.stat().st_size // 1024}k  webp={webp.stat().st_size // 1024}k")


def main() -> None:
    wanted = set(sys.argv[1:] or MAP.values())
    for src_name, dest_name in MAP.items():
        if dest_name not in wanted:
            continue
        src = ROOT / src_name
        if not src.exists():
            print(f"missing {src_name} for {dest_name}", file=sys.stderr)
            continue
        process(src, dest_name)


if __name__ == "__main__":
    main()
