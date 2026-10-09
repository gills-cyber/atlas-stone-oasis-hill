export function isPdfFile(file: File) {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

function extractJpegBytes(buf: Uint8Array): Uint8Array[] {
  const out: Uint8Array[] = [];
  let i = 0;
  while (i < buf.length - 3) {
    if (buf[i] !== 0xff || buf[i + 1] !== 0xd8) {
      i += 1;
      continue;
    }
    let j = i + 2;
    while (j < buf.length - 1) {
      if (buf[j] === 0xff && buf[j + 1] === 0xd9) {
        const slice = buf.subarray(i, j + 2);
        if (slice.length > 8000) out.push(slice.slice());
        i = j + 2;
        break;
      }
      j += 1;
    }
    if (j >= buf.length - 1) break;
  }
  return out;
}

export async function pdfFileToImageBlobs(file: File): Promise<Blob[]> {
  const buf = new Uint8Array(await file.arrayBuffer());
  const head = new TextDecoder("latin1").decode(buf.subarray(0, 8));
  if (!head.startsWith("%PDF")) {
    throw new Error("That file is not a PDF");
  }
  const jpegs = extractJpegBytes(buf);
  if (!jpegs.length) {
    throw new Error("No pages found in this PDF. Export as PNG or JPEG, or use a PDF made of images.");
  }
  return jpegs.map(
    (bytes) => new Blob([bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer], { type: "image/jpeg" }),
  );
}
