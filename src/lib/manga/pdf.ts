function concat(parts: Array<Uint8Array | string>) {
  const bins = parts.map((p) =>
    typeof p === "string" ? new TextEncoder().encode(p) : p,
  );
  const n = bins.reduce((a, p) => a + p.length, 0);
  const out = new Uint8Array(n);
  let o = 0;
  for (const p of bins) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

/** PDF literal UTF-16BE with BOM so manga titles survive in /Info. */
function pdfUnicode(s: string) {
  const units = [0xfeff];
  for (const ch of s) {
    const c = ch.codePointAt(0) ?? 0;
    if (c > 0xffff) {
      const u = c - 0x10000;
      units.push(0xd800 + (u >> 10), 0xdc00 + (u & 0x3ff));
    } else {
      units.push(c);
    }
  }
  return `<${units.map((n) => n.toString(16).padStart(4, "0")).join("")}>`;
}

export type PdfInfo = {
  title?: string;
  author?: string;
};

export function jpegPagesToPdf(
  pages: { jpeg: Uint8Array; width: number; height: number }[],
  info?: PdfInfo,
): Blob {
  const bodies: Uint8Array[] = [];
  const pageCount = pages.length;
  const pageIds: number[] = [];
  const contentIds: number[] = [];
  const imageIds: number[] = [];
  let id = 3;
  for (let i = 0; i < pageCount; i++) {
    pageIds.push(id++);
    contentIds.push(id++);
    imageIds.push(id++);
  }
  const infoId = id++;

  bodies[1] = concat(["<< /Type /Catalog /Pages 2 0 R >>"]);
  bodies[2] = concat([
    `<< /Type /Pages /Count ${pageCount} /Kids [${pageIds.map((n) => `${n} 0 R`).join(" ")}] >>`,
  ]);

  pages.forEach((page, i) => {
    const pageId = pageIds[i]!;
    const contentId = contentIds[i]!;
    const imageId = imageIds[i]!;
    const w = Math.round(page.width);
    const h = Math.round(page.height);
    bodies[pageId] = concat([
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] /Resources << /XObject << /Im0 ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`,
    ]);
    const ops = `q ${w} 0 0 ${h} 0 0 cm /Im0 Do Q`;
    bodies[contentId] = concat([
      `<< /Length ${ops.length} >>\nstream\n${ops}\nendstream`,
    ]);
    bodies[imageId] = concat([
      `<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${page.jpeg.length} >>\nstream\n`,
      page.jpeg,
      "\nendstream",
    ]);
  });

  const title = pdfUnicode(info?.title?.trim() || "Untitled");
  const author = pdfUnicode(info?.author?.trim() || "");
  bodies[infoId] = concat([
    `<< /Title ${title} /Author ${author} /Creator (PanelFox) /Producer (PanelFox) >>`,
  ]);

  const header = "%PDF-1.4\n%\x80\x80\x80\x80\n";
  const parts: Uint8Array[] = [concat([header])];
  const offsets = [0];
  let pos = parts[0]!.length;
  for (let i = 1; i < bodies.length; i++) {
    const body = bodies[i];
    if (!body) continue;
    offsets[i] = pos;
    const obj = concat([`${i} 0 obj\n`, body, "\nendobj\n"]);
    parts.push(obj);
    pos += obj.length;
  }
  const startxref = pos;
  const size = bodies.length;
  let xref = `xref\n0 ${size}\n0000000000 65535 f \n`;
  for (let i = 1; i < size; i++) {
    xref += `${String(offsets[i] ?? 0).padStart(10, "0")} 00000 n \n`;
  }
  const trailer = `trailer\n<< /Size ${size} /Root 1 0 R /Info ${infoId} 0 R >>\nstartxref\n${startxref}\n%%EOF\n`;
  parts.push(concat([xref, trailer]));
  return new Blob([concat(parts)], { type: "application/pdf" });
}
