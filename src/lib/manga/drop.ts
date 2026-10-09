import { fileToPanelSrc, fileToStickerSrc, isImageFile } from "./image";
import { useStudio } from "./store";
import { isPdfFile, pdfFileToImageBlobs } from "./pdf-import";
import { isKomaFile, loadProjectFile } from "./project";

export function isFileDrag(dt: DataTransfer | null | undefined) {
  if (!dt) return false;
  const types = Array.from(dt.types ?? []);
  return (
    types.includes("Files") ||
    types.includes("application/x-moz-file") ||
    types.includes("public.file-url")
  );
}

function filesFromItems(dt: DataTransfer): File[] {
  const out: File[] = [];
  const items = dt.items;
  if (!items?.length) return out;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item || item.kind !== "file") continue;
    const file = item.getAsFile();
    if (file) out.push(file);
  }
  return out;
}

export function incomingFilesFrom(dt: DataTransfer | null | undefined): File[] {
  if (!dt) return [];
  const listed = [...(dt.files ?? [])];
  const fromItems = filesFromItems(dt);
  return listed.length ? listed : fromItems;
}

export function imageFilesFrom(dt: DataTransfer | null | undefined): File[] {
  return incomingFilesFrom(dt).filter(isImageFile);
}

export function imageFilesFromList(
  list: FileList | File[] | null | undefined,
): File[] {
  if (!list) return [];
  return [...list].filter(isImageFile);
}

export function filesFromList(
  list: FileList | File[] | null | undefined,
): File[] {
  if (!list) return [];
  return [...list];
}

export function panelIdAtPoint(
  x: number,
  y: number,
  ignoreId?: string | null,
): string | null {
  if (typeof document === "undefined") return null;
  for (const node of document.elementsFromPoint(x, y)) {
    if (!(node instanceof Element)) continue;
    const hit = node.closest("[data-panel-id]");
    if (hit instanceof HTMLElement && hit.dataset.panelId) {
      if (ignoreId && hit.dataset.panelId === ignoreId) continue;
      return hit.dataset.panelId;
    }
  }
  return null;
}

async function placeBlobs(
  blobs: Blob[],
  panelId?: string | null,
  asPages = false,
) {
  const state = useStudio.getState();
  if (asPages || blobs.length > 1) {
    for (const blob of blobs) {
      const file = new File([blob], "page.jpg", { type: blob.type || "image/jpeg" });
      const src = await fileToPanelSrc(file);
      state.addSplashPage(src);
    }
    return blobs.length;
  }
  const file = new File(
    [blobs[0]!],
    "image.jpg",
    { type: blobs[0]!.type || "image/jpeg" },
  );
  const src = await fileToPanelSrc(file);
  const target = panelId ?? state.selectedPanelId;
  if (target) state.placePhoto(target, src);
  else state.addSplashPage(src);
  return 1;
}

export type ImportKind = "photo" | "background" | "character";

export async function uploadImageFiles(
  files: File[],
  panelId?: string | null,
) {
  return importIncomingFiles(files, panelId);
}

export async function importIncomingFiles(
  files: File[],
  panelId?: string | null,
  kind: ImportKind = "photo",
) {
  const list = files.filter(Boolean);
  if (!list.length) throw new Error("Drop a PNG, JPEG, PDF, or PanelFox file");

  const project = list.find(isKomaFile);
  if (project) {
    await loadProjectFile(project);
    return 1;
  }

  const pdfs = list.filter(isPdfFile);
  const images = list.filter(isImageFile);
  let count = 0;

  for (const pdf of pdfs) {
    const blobs = await pdfFileToImageBlobs(pdf);
    count += await placeBlobs(blobs, panelId, true);
  }

  if (images.length) {
    const state = useStudio.getState();
    const page = state.currentPage();
    const order = page.panels.map((p) => p.id);
    const target = panelId ?? state.selectedPanelId;

    if (kind === "background") {
      const id = target ?? order[0];
      for (const file of images) {
        const src = await fileToPanelSrc(file);
        state.addBackground(src, file.name);
        if (id) state.setPanelBackground(id, src);
        count += 1;
      }
      return count;
    }

    if (kind === "character") {
      const id = target ?? order.find((pid) => {
        const p = page.panels.find((x) => x.id === pid);
        return p?.image || p?.background;
      }) ?? order[0];
      if (!id) throw new Error("Select a panel first");
      for (const file of images) {
        const src = await fileToStickerSrc(file);
        state.addCharacterOnPanel(id, src);
        count += 1;
      }
      return count;
    }

    let start = panelId
      ? order.indexOf(panelId)
      : order.findIndex((id) => {
          const p = page.panels.find((x) => x.id === id);
          return !p?.image;
        });
    if (start < 0) start = 0;

    for (let i = 0; i < images.length; i++) {
      const id = order[start + i];
      const panel = id ? page.panels.find((p) => p.id === id) : null;
      const extraOnFilled =
        images.length === 1 && panel?.image && panel.background;
      if (extraOnFilled && id) {
        const src = await fileToStickerSrc(images[i]!);
        state.addCharacterOnPanel(id, src);
        count += 1;
        continue;
      }
      const src = await fileToPanelSrc(images[i]!);
      if (!id) {
        state.addSplashPage(src);
        continue;
      }
      state.placePhoto(id, src);
      count += 1;
    }
  }

  if (!count && !pdfs.length) throw new Error("Drop a PNG, JPEG, or PDF");
  return count || pdfs.length;
}