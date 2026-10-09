import { fileToPanelSrc } from "./image";
import { useStudio } from "./store";
import type { PanelImage } from "./types";

let copied: PanelImage | null = null;

export function hasCopiedImage() {
  return copied != null;
}

async function srcToBlob(src: string): Promise<Blob> {
  const res = await fetch(src);
  return res.blob();
}

export async function copyPanelImage(panelId: string) {
  const panel = useStudio
    .getState()
    .currentPage()
    .panels.find((p) => p.id === panelId);
  if (!panel?.image) throw new Error("This panel has no image");
  copied = { ...panel.image };
  try {
    const blob = await srcToBlob(panel.image.src);
    const type = blob.type || "image/png";
    await navigator.clipboard.write([
      new ClipboardItem({ [type]: blob }),
    ]);
  } catch {
    /* in-app copy still works */
  }
}

export async function pastePanelImage(panelId: string) {
  try {
    const items = await navigator.clipboard.read();
    for (const item of items) {
      const type = item.types.find((t) => t.startsWith("image/"));
      if (!type) continue;
      const blob = await item.getType(type);
      const file = new File([blob], "paste.png", { type });
      const src = await fileToPanelSrc(file);
      useStudio.getState().setPanelImage(panelId, src);
      return;
    }
  } catch {
    /* fall through to in-app copy */
  }
  if (copied) {
    useStudio.getState().stampImage(panelId, copied);
    return;
  }
  throw new Error("Nothing to paste");
}
