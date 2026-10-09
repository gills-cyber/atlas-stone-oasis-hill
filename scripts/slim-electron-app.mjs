import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { createPackage, listPackage } from "@electron/asar";

const KEEP_LOCALES = new Set(["en-US.pak", "en-GB.pak"]);
const DROP_FILES = [
  "LICENSES.chromium.html",
  "dxcompiler.dll",
  "dxil.dll",
];

export async function slimDir(appDir) {
  if (!existsSync(appDir)) {
    throw new Error(`missing unpacked app: ${appDir}`);
  }

  const resources = join(appDir, "resources");
  const asarPath = join(resources, "app.asar");
  const unpacked = join(resources, "app.asar.unpacked");
  const staging = join(tmpdir(), `panelfox-asar-${Date.now()}`);
  mkdirSync(join(staging, "electron"), { recursive: true });

  const mainSrc = join(process.cwd(), "electron", "main.mjs");
  if (!existsSync(mainSrc)) throw new Error("electron/main.mjs not found");
  cpSync(mainSrc, join(staging, "electron", "main.mjs"));
  writeFileSync(
    join(staging, "package.json"),
    `${JSON.stringify(
      {
        name: "panelfox",
        version: "1.4.0",
        type: "module",
        main: "electron/main.mjs",
      },
      null,
      2,
    )}\n`,
  );

  if (existsSync(asarPath)) rmSync(asarPath, { force: true });
  await createPackage(staging, asarPath);
  rmSync(staging, { recursive: true, force: true });
  if (existsSync(unpacked)) rmSync(unpacked, { recursive: true, force: true });

  const names = listPackage(asarPath);
  if (!names.some((n) => n.includes("main.mjs"))) {
    throw new Error("slim asar missing electron/main.mjs");
  }

  const locales = join(appDir, "locales");
  if (existsSync(locales)) {
    for (const name of readdirSync(locales)) {
      if (!KEEP_LOCALES.has(name)) rmSync(join(locales, name), { force: true });
    }
  }

  for (const name of DROP_FILES) {
    const p = join(appDir, name);
    if (existsSync(p)) rmSync(p, { force: true });
  }

  const grok = join(resources, "desktop-web", "__grok");
  if (existsSync(grok)) rmSync(grok, { recursive: true, force: true });
}

export default async function afterPack(context) {
  if (context.electronPlatformName !== "win32") return;
  await slimDir(context.appOutDir);
}

const invoked = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (invoked) {
  const dir = process.argv[2] || join(process.cwd(), "dist-desktop", "win-unpacked");
  await slimDir(dir);
  console.log("slimmed", dir);
}
