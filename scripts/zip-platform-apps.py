#!/usr/bin/env python3
"""Zip unpacked Electron apps, preserving Unix modes and symlinks."""
from __future__ import annotations

import os
import stat
import zipfile
from pathlib import Path

ROOT = Path("/workspace/dist-desktop")


def add(zf: zipfile.ZipFile, full: Path, arc: str) -> None:
    try:
        st = full.lstat()
    except FileNotFoundError:
        return
    if stat.S_ISLNK(st.st_mode):
        info = zipfile.ZipInfo(arc)
        info.create_system = 3
        info.external_attr = (st.st_mode & 0xFFFF) << 16
        zf.writestr(info, os.readlink(full))
        return
    if stat.S_ISDIR(st.st_mode):
        if not arc.endswith("/"):
            arc += "/"
        info = zipfile.ZipInfo(arc)
        info.create_system = 3
        info.external_attr = ((st.st_mode & 0xFFFF) | 0x4000) << 16
        zf.writestr(info, "")
        for name in sorted(os.listdir(full)):
            add(zf, full / name, arc + name)
        return
    zf.write(full, arcname=arc)


def write_zip(out: Path, entries: list[tuple[Path, str]]) -> None:
    if out.exists():
        out.unlink()
    with zipfile.ZipFile(out, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9, allowZip64=True) as zf:
        for src, arc in entries:
            print("add", src, "->", arc, flush=True)
            add(zf, src, arc)
    print("wrote", out, out.stat().st_size, flush=True)


def main() -> None:
    win_dir = ROOT / "win-unpacked"
    write_zip(
        ROOT / "PanelFox-Windows.zip",
        [
            (win_dir, "PanelFox"),
        ],
    )

    staging_readme = ROOT / "_mac-readme.txt"
    staging_readme.write_text((Path("/workspace/electron/README-macOS.txt")).read_text())
    write_zip(
        ROOT / "PanelFox-macOS.zip",
        [
            (staging_readme, "How to install on Mac.txt"),
            (ROOT / "mac-arm64" / "PanelFox.app", "Apple Silicon/PanelFox.app"),
            (ROOT / "mac" / "PanelFox.app", "Intel/PanelFox.app"),
        ],
    )
    staging_readme.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
