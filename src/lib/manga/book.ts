import { uid } from "@/lib/utils";
import type { BookInfo, Chapter, PageState } from "./types";

export function defaultBook(): BookInfo {
  return {
    title: "",
    author: "",
    series: "",
    volume: "",
    coverFirst: true,
  };
}

export function cloneBook(book: BookInfo): BookInfo {
  return { ...book };
}

export function cloneChapters(chapters: Chapter[]): Chapter[] {
  return chapters.map((c) => ({ ...c }));
}

export type SpreadSlot = {
  left: PageState | null;
  right: PageState | null;
  reading: PageState[];
  isCover: boolean;
};

export function pageIndex(pages: PageState[], pageId: string) {
  return pages.findIndex((p) => p.id === pageId);
}

/** Cover, or 1-based interior number (cover does not consume a folio). */
export function pageFolio(
  pages: PageState[],
  pageId: string,
  coverFirst: boolean,
): string {
  const i = pageIndex(pages, pageId);
  if (i < 0) return "";
  if (coverFirst && i === 0) return "Cover";
  return String(coverFirst ? i : i + 1);
}

export function pageLabel(
  pages: PageState[],
  pageId: string,
  coverFirst: boolean,
): string {
  const folio = pageFolio(pages, pageId, coverFirst);
  if (!folio) return "Page";
  if (folio === "Cover") return "Cover";
  return `Page ${folio}`;
}

export function needsPad(pageCount: number, coverFirst: boolean) {
  const interiors = coverFirst ? Math.max(0, pageCount - 1) : pageCount;
  return interiors % 2 === 1;
}

function pairSlot(
  earlier: PageState,
  later: PageState | null,
  rtl: boolean,
  isCover: boolean,
): SpreadSlot {
  const reading = later ? [earlier, later] : [earlier];
  if (rtl) {
    return { left: later, right: earlier, reading, isCover };
  }
  return { left: earlier, right: later, reading, isCover };
}

function coverSlot(cover: PageState, rtl: boolean): SpreadSlot {
  return rtl
    ? { left: cover, right: null, reading: [cover], isCover: true }
    : { left: null, right: cover, reading: [cover], isCover: true };
}

export function allSpreads(
  pages: PageState[],
  opts: { coverFirst: boolean; rtl: boolean },
): SpreadSlot[] {
  const slots: SpreadSlot[] = [];
  if (!pages.length) return slots;
  let i = 0;
  if (opts.coverFirst) {
    slots.push(coverSlot(pages[0]!, opts.rtl));
    i = 1;
  }
  for (; i < pages.length; i += 2) {
    slots.push(pairSlot(pages[i]!, pages[i + 1] ?? null, opts.rtl, false));
  }
  return slots;
}

export function facingSpread(
  pages: PageState[],
  pageId: string,
  opts: { coverFirst: boolean; rtl: boolean },
): SpreadSlot {
  const slots = allSpreads(pages, opts);
  const hit =
    slots.find(
      (s) => s.left?.id === pageId || s.right?.id === pageId,
    ) ?? slots[0];
  return (
    hit ?? {
      left: pages[0] ?? null,
      right: null,
      reading: pages[0] ? [pages[0]] : [],
      isCover: Boolean(opts.coverFirst),
    }
  );
}

export function sanitizeChapters(
  chapters: Chapter[],
  pages: PageState[],
): Chapter[] {
  const ids = new Set(pages.map((p) => p.id));
  const seen = new Set<string>();
  const ordered = [...chapters].sort(
    (a, b) => pageIndex(pages, a.startPageId) - pageIndex(pages, b.startPageId),
  );
  const out: Chapter[] = [];
  for (const c of ordered) {
    if (!ids.has(c.startPageId)) continue;
    if (seen.has(c.startPageId)) continue;
    seen.add(c.startPageId);
    out.push(c);
  }
  return out;
}

export function chapterOfPage(
  chapters: Chapter[],
  pages: PageState[],
  pageId: string,
): Chapter | null {
  const idx = pageIndex(pages, pageId);
  if (idx < 0) return null;
  const starts = sanitizeChapters(chapters, pages)
    .map((c) => ({ c, i: pageIndex(pages, c.startPageId) }))
    .filter((x) => x.i >= 0);
  let found: Chapter | null = null;
  for (const s of starts) {
    if (s.i <= idx) found = s.c;
    else break;
  }
  return found;
}

export function groupPagesByChapter(
  pages: PageState[],
  chapters: Chapter[],
): { chapter: Chapter | null; pages: PageState[] }[] {
  const starts = new Map(
    sanitizeChapters(chapters, pages).map((c) => [c.startPageId, c]),
  );
  const groups: { chapter: Chapter | null; pages: PageState[] }[] = [];
  let current: { chapter: Chapter | null; pages: PageState[] } | null = null;
  for (const p of pages) {
    const ch = starts.get(p.id);
    if (ch || !current) {
      current = { chapter: ch ?? null, pages: [p] };
      groups.push(current);
    } else {
      current.pages.push(p);
    }
  }
  return groups;
}

export function pagesInChapter(
  pages: PageState[],
  chapters: Chapter[],
  chapterId: string,
): PageState[] {
  const groups = groupPagesByChapter(pages, chapters);
  return groups.find((g) => g.chapter?.id === chapterId)?.pages ?? [];
}

export type BookRange = "page" | "spread" | "chapter" | "all";

export function pagesForRange(
  pages: PageState[],
  range: BookRange,
  currentPageId: string,
  chapters: Chapter[],
  opts: { coverFirst: boolean; rtl: boolean },
): PageState[] {
  if (range === "page") {
    const page = pages.find((p) => p.id === currentPageId);
    return page ? [page] : pages.slice(0, 1);
  }
  if (range === "spread") {
    return facingSpread(pages, currentPageId, opts).reading;
  }
  if (range === "chapter") {
    const ch = chapterOfPage(chapters, pages, currentPageId);
    if (!ch) return pages;
    const inCh = pagesInChapter(pages, chapters, ch.id);
    return inCh.length ? inCh : pages;
  }
  return pages;
}

export function makeChapter(startPageId: string, title?: string, n = 1): Chapter {
  return {
    id: uid("ch"),
    title: (title ?? "").trim() || `Chapter ${n}`,
    startPageId,
  };
}

function xmlEsc(s: string) {
  return s
    .replace(/&/g, `\u0026amp;`)
    .replace(/</g, `\u0026lt;`)
    .replace(/>/g, `\u0026gt;`)
    .replace(/"/g, `\u0026quot;`);
}

export function bookDisplayTitle(book: BookInfo, fallback: string) {
  return book.title.trim() || fallback.trim() || "Untitled";
}

export function comicInfoXml(
  book: BookInfo,
  pages: PageState[],
  chapters: Chapter[],
  opts: { rtl: boolean; fallbackTitle: string },
): string {
  const title = xmlEsc(bookDisplayTitle(book, opts.fallbackTitle));
  const writer = xmlEsc(book.author.trim());
  const series = xmlEsc(book.series.trim());
  const volume = xmlEsc(book.volume.trim());
  const pageNodes: string[] = [];
  if (book.coverFirst && pages[0]) {
    pageNodes.push(`    <Page Image="0" Type="FrontCover"/>`);
  }
  for (const ch of sanitizeChapters(chapters, pages)) {
    const i = pageIndex(pages, ch.startPageId);
    if (i < 0) continue;
    const type =
      book.coverFirst && i === 0 ? "FrontCover" : "Story";
    pageNodes.push(
      `    <Page Image="${i}" Type="${type}" Bookmark="${xmlEsc(ch.title)}"/>`,
    );
  }
  return `<?xml version="1.0" encoding="utf-8"?>
<ComicInfo xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <Title>${title}</Title>
${series ? `  <Series>${series}</Series>\n` : ""}${volume ? `  <Number>${volume}</Number>\n` : ""}${writer ? `  <Writer>${writer}</Writer>\n` : ""}  <PageCount>${pages.length}</PageCount>
  <Manga>${opts.rtl ? "YesAndRightToLeft" : "No"}</Manga>
  <Notes>Exported from PanelFox</Notes>
  <Pages>
${pageNodes.join("\n")}
  </Pages>
</ComicInfo>
`;
}

export function exportSpreadsFor(
  pages: PageState[],
  allPages: PageState[],
  opts: { coverFirst: boolean; rtl: boolean },
): SpreadSlot[] {
  const includesCover = Boolean(
    opts.coverFirst &&
      pages[0] &&
      allPages[0] &&
      pages[0].id === allPages[0].id,
  );
  return allSpreads(pages, { coverFirst: includesCover, rtl: opts.rtl });
}

export {
  folioToPageIndex,
  gapPositionFromRects,
  insertIndexFromMidpoints,
  insertIndexFromRects,
  labelForIndex,
  moveItem,
  parseSendTo,
} from "./page-order";
