#!/usr/bin/env python3
"""Chroma-key magenta anime stickers to transparent PNG and crop."""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image

MAGENTA = np.array([255.0, 0.0, 255.0])


def key_magenta(arr: np.ndarray) -> np.ndarray:
    rgb = arr[:, :, :3].astype(np.float32)
    r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    dist = np.sqrt((r - 255.0) ** 2 + (g - 0.0) ** 2 + (b - 255.0) ** 2)
    # Soft window: near-magenta fully gone, mid-distance feathered.
    alpha = np.clip((dist - 38.0) / 72.0, 0.0, 1.0)
    mag = np.clip((r - g) / 220.0, 0.0, 1.0) * np.clip((b - g) / 220.0, 0.0, 1.0)
    alpha = alpha * (1.0 - mag * 0.92)
    # Despill remaining fringe toward luminance.
    luma = 0.2126 * r + 0.7152 * g + 0.0722 * b
    spill = mag
    rgb[:, :, 0] = r * (1.0 - spill * 0.65) + luma * spill * 0.65
    rgb[:, :, 2] = b * (1.0 - spill * 0.65) + luma * spill * 0.65
    out = np.empty_like(arr)
    out[:, :, :3] = np.clip(rgb, 0, 255)
    out[:, :, 3] = np.clip(alpha * 255.0, 0, 255)
    return out.astype(np.uint8)


def crop(arr: np.ndarray, pad: int = 24) -> np.ndarray:
    a = arr[:, :, 3]
    ys, xs = np.where(a > 10)
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


def process(src: Path, dest: Path, max_side: int = 2048) -> None:
    im = Image.open(src).convert("RGBA")
    arr = key_magenta(np.asarray(im))
    arr = crop(arr)
    out = Image.fromarray(arr, "RGBA")
    out = upscale(out, max_side)
    dest.parent.mkdir(parents=True, exist_ok=True)
    out.save(dest, "PNG", optimize=True)
    print(f"{dest.name}: {out.size[0]}x{out.size[1]}")


MAP = {
    "steam": "86dfcf34-a2d3-46ab-aa95-3aa04c64615c.jpg",
    "breath": "f6c06bb8-1d3e-4c37-bc56-8f770602e283.jpg",
    "fog": "42f81aaf-cd7c-442e-9edd-6a140364f7fa.jpg",
    "sparkle": "8ac870aa-1991-4ed0-bc6e-ebc5a2c5217c.jpg",
    "sweat": "85413cd4-a619-4f0a-8ced-353748532f22.jpg",
    "heart": "426b443f-d342-42e2-b435-5308fa79927c.jpg",
    "blush": "9c19d9b6-ded8-4bbb-8b08-62b04ba9af7c.jpg",
    "tear": "40ea3f9c-d7b1-4751-9e86-6890d3cefc73.jpg",
    "petals": "ee226c16-d7b4-41e9-b602-a13bbca37464.jpg",
    "impact": "82332434-0426-4174-bda9-5d30e1b92ae7.jpg",
    "aura": "416ad28f-570f-4298-ac02-9f6ec0f4ca5c.jpg",
    "smoke": "f60808b8-b0b9-474c-a524-3f0cbb1a69da.jpg",
    "chill": "b5d973f0-530c-4d68-884d-bf94dc255682.jpg",
    "vein": "374a8070-5343-4466-b1cf-44b340da9d73.jpg",
}


def main() -> None:
    root = Path("/workspace/artifacts/imagine_images")
    dest_dir = Path("/workspace/public/stickers/anime")
    names = sys.argv[1:] or list(MAP)
    for name in names:
        src = root / MAP[name]
        process(src, dest_dir / f"{name}.png")


if __name__ == "__main__":
    main()
