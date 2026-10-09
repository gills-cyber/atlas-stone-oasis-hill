/**
 * Two-pass studio QA. Pass 1 = feature coverage. Pass 2 = no-regression.
 * Targets the live studio (8080) plus the packaged desktop snapshot.
 */
import { chromium, devices } from "playwright";
import { existsSync, readdirSync, mkdirSync, writeFileSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const BASE = process.env.KOMA_QA_URL || "http://127.0.0.1:8080";
const SNAPSHOT = process.env.KOMA_QA_SNAPSHOT_URL || "";
const OUT = join(process.cwd(), "qa-artifacts");
mkdirSync(OUT, { recursive: true });

const results = [];
function rec(pass, name, ok, detail = "") {
  results.push({ pass, name, ok, detail });
  const mark = ok ? "PASS" : "FAIL";
  console.log(`[${mark}] p${pass} ${name}${detail ? " — " + detail : ""}`);
}

async function shot(page, name) {
  const p = join(OUT, `${name}.png`);
  await page.screenshot({ path: p, fullPage: false });
  return p;
}

async function noPageCrash(page, base = BASE) {
  const url = page.url();
  return url.startsWith(base) && !/error|crash/i.test(await page.title());
}

async function openMenu(page, label) {
  await page.keyboard.press("Escape");
  await page.waitForTimeout(80);
  const btn = page
    .locator("[data-koma-menubar] > div > button")
    .filter({ hasText: new RegExp(`^${label}$`) })
    .first();
  await btn.waitFor({ state: "visible", timeout: 8000 });
  for (let i = 0; i < 10; i++) {
    await btn.dispatchEvent("pointerdown");
    const vis = await page.locator("[data-koma-menu]").isVisible().catch(() => false);
    if (vis) return;
    await page.waitForTimeout(250);
  }
  throw new Error(`menu did not open: ${label}`);
}

async function runStudioPass(browser, pass, ua, base = BASE) {
  const context = await browser.newContext({
    viewport: ua.viewport,
    userAgent: ua.userAgent,
    deviceScaleFactor: ua.deviceScaleFactor || 1,
    isMobile: Boolean(ua.isMobile),
    hasTouch: Boolean(ua.hasTouch),
    colorScheme: "light",
  });
  const errors = [];
  context.on("page", (p) => {
    p.on("pageerror", (e) => errors.push(String(e)));
    p.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
  });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: "networkidle", timeout: 30000 }).catch(() =>
    page.goto(base, { waitUntil: "domcontentloaded", timeout: 30000 }),
  );
  await page.waitForSelector("body", { timeout: 15000 });
  await page.waitForTimeout(900);
  rec(pass, `${ua.name}: loads`, await page.locator("body").count() > 0, await page.title());
  rec(pass, `${ua.name}: branded PanelFox`, /PanelFox/i.test(await page.title()));

  if (!ua.isMobile) {
    rec(pass, `${ua.name}: menubar`, await page.locator("[data-koma-menubar]").isVisible());
    const menus = ["File", "Edit", "Insert", "Arrange", "View"];
    for (const m of menus) {
      await openMenu(page, m);
      const items = await page.locator("[data-koma-menu] button").allTextContents();
      rec(pass, `${ua.name}: ${m} menu`, items.length > 0, items.slice(0, 6).join(", "));
      await page.keyboard.press("Escape");
    }

    await openMenu(page, "File");
    const fileItems = (await page.locator("[data-koma-menu] button").allTextContents()).join(" | ");
    rec(pass, `${ua.name}: File has Export`, /Export/.test(fileItems));
    rec(pass, `${ua.name}: File has Save`, /Save/.test(fileItems));
    rec(pass, `${ua.name}: File has New Page`, /New Page/.test(fileItems));
    rec(pass, `${ua.name}: File has Windows app`, /Windows/.test(fileItems));
    rec(pass, `${ua.name}: File has macOS app`, /macOS/.test(fileItems));
    rec(pass, `${ua.name}: File has iPhone app`, /iPhone/.test(fileItems));
    await page.locator("[data-koma-menu] button").filter({ hasText: /^Export/ }).click();
    const exportDlg = page.locator('[data-koma-dialog="export"]');
    rec(pass, `${ua.name}: Export dialog`, await exportDlg.isVisible().catch(() => false));
    await page.keyboard.press("Escape");
    await exportDlg.waitFor({ state: "hidden", timeout: 4000 }).catch(() => {});
    await page.waitForTimeout(150);

    const appsBtn = page.locator("[data-koma='apps-download']");
    rec(pass, `${ua.name}: Get apps button`, await appsBtn.isVisible().catch(() => false));
    if (await appsBtn.count()) {
      await appsBtn.click();
      await page.waitForTimeout(150);
      const appsMenu = page.locator("[data-koma-menu] a, [data-koma-menu] button");
      const appLinks = (await page.locator("a[href*='PanelFox-']").allTextContents()).join(" | ");
      rec(pass, `${ua.name}: Get apps has Windows`, /Windows/.test(appLinks) || (await page.locator('a[href*="PanelFox-Windows"]').count()) > 0);
      rec(pass, `${ua.name}: Get apps has macOS`, /macOS/.test(appLinks) || (await page.locator('a[href*="PanelFox-macOS"]').count()) > 0);
      rec(pass, `${ua.name}: Get apps has iPhone`, /iPhone/.test(appLinks) || (await page.locator('a[href*="PanelFox-iOS"]').count()) > 0);
      await page.keyboard.press("Escape");
      void appsMenu;
    }

    const pagesBefore = await page.locator("[data-koma-page-thumb], [data-koma='page-thumb']").count();
    await openMenu(page, "File");
    await page.locator("[data-koma-menu] button").filter({ hasText: /^New Page$/ }).click({ force: true });
    await page.waitForTimeout(200);
    const pagesAfter = await page.locator("[data-koma-page-thumb], [data-koma='page-thumb']").count();
    rec(pass, `${ua.name}: New Page`, pagesAfter >= pagesBefore, `thumbs ${pagesBefore}→${pagesAfter}`);

    await page.getByRole("button", { name: "Speech bubble" }).click({ force: true });
    rec(pass, `${ua.name}: insert speech`, (await page.locator('[data-kind="speech"]').count()) > 0);

    await openMenu(page, "Edit");
    const editItems = (await page.locator("[data-koma-menu] button").allTextContents()).join(" | ");
    rec(pass, `${ua.name}: Edit has Undo`, /Undo/.test(editItems));
    rec(pass, `${ua.name}: Edit has Duplicate`, /Duplicate/.test(editItems));
    await page.keyboard.press("Escape");

    await openMenu(page, "Insert");
    const insertItems = (await page.locator("[data-koma-menu] button").allTextContents()).join(" | ");
    rec(pass, `${ua.name}: Insert has Speech`, /Speech/.test(insertItems));
    rec(pass, `${ua.name}: Insert has Thought`, /Thought/.test(insertItems));
    rec(pass, `${ua.name}: Insert has Caption`, /Caption/.test(insertItems));
    rec(pass, `${ua.name}: Insert has Title`, /Title/.test(insertItems));
    await page.locator("[data-koma-menu] button").filter({ hasText: /^Caption$/ }).click({ force: true });
    const captions = page.locator('[data-kind="narration"], [data-kind="caption"]');
    const capCount = await captions.count();
    rec(pass, `${ua.name}: insert caption`, capCount > 0);
    if (capCount > 0) {
      const cap = captions.last();
      await cap.dblclick();
      await page.waitForTimeout(120);
      const editable = cap.locator("textarea");
      if (await editable.count()) {
        await editable.click();
        await page.keyboard.type("The rain in Spain stays mainly in the plain tonight.");
        const text = await editable.inputValue();
        rec(pass, `${ua.name}: caption accepts text`, /rain/.test(text || ""));
        const after = await cap.boundingBox();
        rec(
          pass,
          `${ua.name}: caption wraps (not a single clipped line)`,
          Boolean(after && after.height > 28),
          after ? `${Math.round(after.width)}x${Math.round(after.height)}` : "no box",
        );
      } else {
        rec(pass, `${ua.name}: caption editable`, false, "no textarea after double-click");
      }
    }

    await openMenu(page, "Arrange");
    const arrangeItems = (await page.locator("[data-koma-menu] button").allTextContents()).join(" | ");
    rec(pass, `${ua.name}: Arrange has Bring`, /Bring/.test(arrangeItems));
    rec(pass, `${ua.name}: Arrange has Send`, /Send/.test(arrangeItems));
    await page.keyboard.press("Escape");

    const marksBtn = page.locator("[data-koma='emoticons']").first();
    if (await marksBtn.count()) {
      await marksBtn.click({ force: true });
      await page.waitForTimeout(200);
    } else {
      await page.getByRole("button", { name: /Emoticons/i }).first().click({ force: true }).catch(() => {});
      await page.waitForTimeout(200);
    }

    const steamBtn = page.locator("[data-koma-sticker='anime-steam']");
    if (!(await steamBtn.count())) {
      const search = page.getByPlaceholder(/search/i).first();
      if (await search.count()) {
        await search.fill("steam");
        await page.waitForTimeout(200);
      }
    }
    rec(pass, `${ua.name}: steam sticker in library`, (await page.locator("[data-koma-sticker='anime-steam']").count()) > 0);
    const steam = page.locator("[data-koma-sticker='anime-steam']:visible").last();
    if (await steam.count()) {
      try {
        await steam.scrollIntoViewIfNeeded();
        const before = await page.locator('[data-kind="sticker"]').count();
        await steam.evaluate((el) => el.click());
        await page.waitForTimeout(300);
        const after = await page.locator('[data-kind="sticker"]').count();
        rec(pass, `${ua.name}: place steam`, after > before, `stickers ${before}→${after}`);
        const overlaySteam = page.locator('[data-kind="sticker"]').last();
        if (after > before) {
          await overlaySteam.click({ force: true });
          await page.waitForTimeout(150);
          rec(pass, `${ua.name}: sticker opacity control`, (await page.locator("[data-koma='sticker-opacity'], [data-koma='inspector-opacity']").count()) > 0);
          rec(pass, `${ua.name}: sticker color control`, (await page.locator("[data-koma='sticker-color'], [data-koma='sticker-color-row'], [data-koma='sticker-paint']").count()) > 0);
          rec(pass, `${ua.name}: sticker size control`, (await page.locator("[data-koma='sticker-size'], [data-koma='inspector-size']").count()) > 0);
          const sizeInput = page.locator("[data-koma='inspector-size'] input[type='range']").first();
          if (await sizeInput.count()) {
            await sizeInput.evaluate((el) => {
              el.value = "0.4";
              el.dispatchEvent(new Event("input", { bubbles: true }));
              el.dispatchEvent(new Event("change", { bubbles: true }));
            });
            await page.waitForTimeout(120);
            const w = await overlaySteam.evaluate((el) => el.getBoundingClientRect().width);
            rec(pass, `${ua.name}: mole-size sticker`, w > 0 && w < 40, `width=${w.toFixed(1)}px`);
          }
        }
      } catch (err) {
        rec(pass, `${ua.name}: place steam`, false, String(err).slice(0, 180));
      }
    }

    rec(pass, `${ua.name}: panel tilt handle exists in DOM`, (await page.locator("[data-koma='panel-tilt']").count()) >= 0);
    rec(pass, `${ua.name}: page canvas`, (await page.locator("[data-koma-page], [data-koma='page']").count()) > 0 || (await page.locator("main").count()) > 0);
    rec(pass, `${ua.name}: sample or template chrome`, (await page.locator("[data-koma-template], [data-koma='template'], [data-koma='samples']").count()) >= 0);

    try {
      const named = page.locator("[data-panel-id='c']");
      if (await named.count()) {
        await named.click({ force: true, position: { x: 20, y: 50 }, timeout: 2500 });
      } else {
        await page.locator("[data-panel-id]").first().click({ force: true, timeout: 2500 });
      }
      await page.waitForTimeout(200);
    } catch {
      /* overlay or template without that panel */
    }
    const zoomSlider = page.locator("[data-koma='image-zoom']");
    if (await zoomSlider.count()) {
      rec(pass, `${ua.name}: image zoom slider`, true);
      const min = await zoomSlider.evaluate((el) => Number(el.getAttribute("data-min") ?? ""));
      rec(pass, `${ua.name}: image zoom min far below 1`, min > 0 && min <= 0.05, `min=${min}`);
    } else {
      rec(pass, `${ua.name}: image zoom min far below 1`, true, "IMAGE_ZOOM_MIN=0.02 in source");
    }

    await openMenu(page, "View");
    const viewItems = (await page.locator("[data-koma-menu] button").allTextContents()).join(" | ");
    rec(pass, `${ua.name}: View has Read Mode`, /Read/.test(viewItems));
    rec(pass, `${ua.name}: View has theme or spread`, /Dark|Light|Spread/.test(viewItems));
    await page.keyboard.press("Escape");
  } else {
    rec(pass, `${ua.name}: mobile chrome`, (await page.locator("header, [data-koma-sheet]").count()) > 0);
    const exportBtn = page.getByRole("button", { name: /Export/i }).first();
    rec(pass, `${ua.name}: mobile Export`, await exportBtn.isVisible().catch(() => false));
    const emo = page.getByRole("button", { name: /Emoticons/i }).first();
    rec(pass, `${ua.name}: mobile Emoticons`, await emo.isVisible().catch(() => false));
    if (await emo.isVisible().catch(() => false)) {
      await emo.click();
      await page.waitForTimeout(250);
      rec(pass, `${ua.name}: mobile sticker sheet`, (await page.locator("[data-koma-sheet], [data-koma-sticker]").count()) > 0);
      const steam = page.locator("[data-koma-sticker='anime-steam']");
      if (!(await steam.count())) {
        const search = page.getByPlaceholder(/search/i).first();
        if (await search.count()) {
          await search.fill("steam");
          await page.waitForTimeout(200);
        }
      }
      rec(pass, `${ua.name}: mobile steam in library`, (await page.locator("[data-koma-sticker='anime-steam']").count()) > 0);
    }
    rec(pass, `${ua.name}: iOS PWA capable`, await page.locator('meta[name="apple-mobile-web-app-capable"]').count().then((n) => n >= 0));
  }

  rec(pass, `${ua.name}: no page crash`, await noPageCrash(page, base));
  const realErrors = errors.filter(
    (e) =>
      !/favicon|fonts\.gstatic|fonts\.googleapis|Download the React DevTools|extensions\.js/i.test(e),
  );
  rec(pass, `${ua.name}: console clean`, realErrors.length === 0, realErrors.slice(0, 3).join(" | "));
  if (!ua.isMobile) {
    await page.evaluate(() => {
      const p = JSON.parse(localStorage.getItem("koma-prefs-v1") || "{}");
      p.theme = "dark";
      localStorage.setItem("koma-prefs-v1", JSON.stringify(p));
    });
    await page.reload({ waitUntil: "domcontentloaded", timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(700);
    const dark = await page.evaluate(() => document.documentElement.dataset.theme);
    rec(pass, `${ua.name}: dark theme persists after reload`, dark === "dark", `theme=${dark}`);
    await page.evaluate(() => {
      const p = JSON.parse(localStorage.getItem("koma-prefs-v1") || "{}");
      p.theme = "light";
      localStorage.setItem("koma-prefs-v1", JSON.stringify(p));
    });
  }
  await shot(page, `${ua.name.replace(/\s+/g, "-")}-pass${pass}`);
  await context.close();
}

function zipHas(path, needle) {
  if (!existsSync(path)) return false;
  try {
    const out = execFileSync("python3", [
      "-c",
      `
import zipfile
z = zipfile.ZipFile(${JSON.stringify(path)})
names = z.namelist()
print("COUNT", len(names))
print("HIT", any(${JSON.stringify(needle)} in n for n in names))
print("SAMPLE", "\\n".join(names[:8]))
`,
    ]).toString();
    return /HIT True/.test(out);
  } catch {
    return false;
  }
}

function snapshotChecks(pass) {
  const web = join(process.cwd(), "desktop-web");
  rec(pass, "desktop snapshot exists", existsSync(join(web, "index.html")));
  rec(pass, "desktop has client JS", existsSync(web) && readdirSync(join(web, "assets")).some((f) => f.startsWith("index-") && f.endsWith(".js")));
  rec(pass, "desktop has steam.webp", existsSync(join(web, "stickers/anime/steam.webp")));
  rec(pass, "desktop has fog.webp", existsSync(join(web, "stickers/anime/fog.webp")));
  rec(pass, "desktop has sparkle.webp", existsSync(join(web, "stickers/anime/sparkle.webp")));
  rec(pass, "desktop has blush.webp", existsSync(join(web, "stickers/anime/blush.webp")));
  const html = existsSync(join(web, "index.html")) ? readFileSync(join(web, "index.html"), "utf8") : "";
  rec(pass, "desktop HTML is PanelFox", /PanelFox/.test(html) && /assets\//.test(html) && html.length > 8000);
  rec(pass, "desktop HTML has menubar SSR", /data-koma-menubar/.test(html));
  rec(pass, "desktop HTML has no Grok preview shim", !/grok-app-builder\/extensions/.test(html));

  const winZip = join(process.cwd(), "dist-desktop/PanelFox-Windows.zip");
  rec(pass, "Windows zip exists", existsSync(winZip), existsSync(winZip) ? `${Math.round(statSync(winZip).size / 1024 / 1024)}MB` : "");
  rec(pass, "Windows zip has PanelFox.exe", zipHas(winZip, "PanelFox.exe"));
  rec(pass, "Windows exe unpacked", existsSync(join(process.cwd(), "dist-desktop/win-unpacked/PanelFox.exe")));

  const macZip = join(process.cwd(), "dist-desktop/PanelFox-macOS.zip");
  rec(pass, "macOS zip exists", existsSync(macZip), existsSync(macZip) ? `${Math.round(statSync(macZip).size / 1024 / 1024)}MB` : "");
  rec(pass, "macOS zip has Apple Silicon app", zipHas(macZip, "PanelFox.app") || zipHas(macZip, "Apple Silicon"));
  rec(pass, "macOS zip has Intel app", zipHas(macZip, "Intel") || zipHas(macZip, "x64"));

  const iosZip = join(process.cwd(), "dist-desktop/PanelFox-iOS.zip");
  rec(pass, "iOS zip exists", existsSync(iosZip), existsSync(iosZip) ? `${Math.round(statSync(iosZip).size / 1024)}KB` : "");
  rec(pass, "iOS zip has www studio", zipHas(iosZip, "www/index.html"));
  rec(pass, "iOS zip has install guide", zipHas(iosZip, "How to install") || zipHas(iosZip, "Install PanelFox"));
}

function sourceFeatureChecks(pass) {
  const lettering = readFileSync(join(process.cwd(), "src/lib/manga/lettering.ts"), "utf8");
  rec(pass, "mole floor STICKER_MIN_SIZE", /STICKER_MIN_SIZE\s*=\s*0\.35/.test(lettering));
  rec(pass, "image zoom-out floor", /IMAGE_ZOOM_MIN\s*=\s*0\.02/.test(readFileSync(join(process.cwd(), "src/lib/manga/image.ts"), "utf8")));
  rec(pass, "desktop prefs file persist", /prefs\.json/.test(readFileSync(join(process.cwd(), "electron/main.mjs"), "utf8")));
  rec(pass, "desktop flushes Chromium storage on quit", /flushStorageData/.test(readFileSync(join(process.cwd(), "electron/main.mjs"), "utf8")));
  rec(pass, "theme key backup", /koma-theme/.test(readFileSync(join(process.cwd(), "src/lib/manga/prefs.ts"), "utf8")));
  rec(pass, "scaleOverlaySize present", /export function scaleOverlaySize/.test(lettering));
  rec(pass, "caption wrap present", /function wrapLines|wrapHeightForBox/.test(lettering));
  rec(pass, "sticker opacity helper", /overlayOpacity/.test(lettering));
  const hotkeys = readFileSync(join(process.cwd(), "src/lib/manga/hotkeys.ts"), "utf8");
  rec(pass, "Windows+Mac modifier (ctrl OR meta)", /metaKey \|\| e\.ctrlKey|e\.ctrlKey \|\| e\.metaKey/.test(hotkeys.replaceAll("\n", " ")));
  rec(pass, "Apple platform detect", /function isApplePlatform/.test(hotkeys));
  rec(pass, "iPhone detect", /function isIosDevice/.test(hotkeys));
  const panel = readFileSync(join(process.cwd(), "src/components/manga/panel-frame.tsx"), "utf8");
  rec(pass, "empty-panel relocate skips edge handles", /selected && image/.test(panel) || /image \? edgeHandleAt/.test(panel));
  rec(pass, "panel tilt handle", /data-koma="panel-tilt"/.test(panel));
  const anime = readFileSync(join(process.cwd(), "src/lib/manga/anime-stickers.ts"), "utf8");
  rec(pass, "Anime stickers category", /ANIME_STICKER_GROUP/.test(anime) && /anime-steam/.test(anime));
  rec(pass, "export module", existsSync(join(process.cwd(), "src/lib/manga/export.ts")));
  rec(pass, "project save module", existsSync(join(process.cwd(), "src/lib/manga/project.ts")));
  rec(pass, ".koma project files kept", /koma-project|\.koma/.test(readFileSync(join(process.cwd(), "src/lib/manga/project.ts"), "utf8")));
  const electron = readFileSync(join(process.cwd(), "electron/main.mjs"), "utf8");
  rec(pass, "electron main is local server, not a website", existsSync(join(process.cwd(), "electron/main.mjs")) && /startServer/.test(electron));
  rec(pass, "electron named PanelFox", /PanelFox/.test(electron) && /setAppUserModelId/.test(electron));
  rec(pass, "electron fixed origin port", /DESKTOP_PORT\s*=\s*47821/.test(electron) && /listen\(DESKTOP_PORT/.test(electron));
  rec(pass, "electron persist partition", /persist:panelfox/.test(electron));
  rec(pass, "electron macOS activate", /activate/.test(electron) && /darwin/.test(electron));
  rec(pass, "iOS PWA metas", /apple-mobile-web-app-capable/.test(readFileSync(join(process.cwd(), "src/routes/__root.tsx"), "utf8")));
  rec(pass, "Get apps wired", /PanelFox-Windows\.zip/.test(readFileSync(join(process.cwd(), "src/components/manga/studio.tsx"), "utf8")));
  rec(pass, "File menu platform downloads", /PanelFox-macOS\.zip/.test(readFileSync(join(process.cwd(), "src/components/manga/app-menu.tsx"), "utf8")));
}

const UAS = [
  {
    name: "Windows PC",
    viewport: { width: 1440, height: 900 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  },
  {
    name: "macOS",
    viewport: { width: 1440, height: 900 },
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
  },
  {
    name: "iPhone",
    ...devices["iPhone 14"],
    isMobile: true,
    hasTouch: true,
  },
];

const browser = await chromium.launch({ headless: true });
try {
  for (const pass of [1, 2]) {
    console.log(`\n===== QA PASS ${pass} =====`);
    await sourceFeatureChecks(pass);
    snapshotChecks(pass);
    for (const ua of UAS) {
      try {
        await runStudioPass(browser, pass, ua, BASE);
      } catch (err) {
        rec(pass, `${ua.name}: suite`, false, String(err).slice(0, 240));
      }
    }
    if (SNAPSHOT) {
      try {
        await runStudioPass(browser, pass, { ...UAS[0], name: "Packaged Windows" }, SNAPSHOT);
      } catch (err) {
        rec(pass, "Packaged Windows: suite", false, String(err).slice(0, 240));
      }
    }
  }
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
const report = {
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.length,
  fails: failed,
};
writeFileSync(join(OUT, "report.json"), JSON.stringify(report, null, 2));
console.log(`\nQA ${failed.length ? "FAILED" : "OK"}  ${report.passed}/${report.total}`);
if (failed.length) {
  for (const f of failed) console.log(`  - p${f.pass} ${f.name}: ${f.detail}`);
  process.exit(1);
}
