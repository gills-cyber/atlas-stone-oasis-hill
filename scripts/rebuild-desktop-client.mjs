import { spawn } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync, cpSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const dests = [
  join(root, "desktop-web"),
  join(root, "dist-desktop", "win-unpacked", "resources", "desktop-web"),
];
const marker = "toggleReadMode";
const STATIC_CANDIDATES = [
  join(root, "dist", "client"),
  join(root, ".vercel", "output", "static"),
  join(root, "dist"),
  join(root, ".output", "public"),
];

function findStaticDir() {
  for (const dir of STATIC_CANDIDATES) {
    const assets = join(dir, "assets");
    if (existsSync(assets)) return dir;
  }
  return join(root, "dist", "client");
}

function assetDir() {
  const staticDir = findStaticDir();
  const dir = join(staticDir, "assets");
  if (!existsSync(dir)) return null;
  const files = readdirSync(dir);
  const js = files.filter((f) => f.endsWith(".js"));
  const styles = files.find((f) => f.startsWith("styles-") && f.endsWith(".css"));
  let indexJs = null;
  let routesJs = null;
  let hasMarker = false;
  for (const f of js) {
    const blob = readFileSync(join(dir, f), "utf8");
    if (blob.includes(marker)) hasMarker = true;
    if (f.startsWith("index-")) {
      if (blob.includes(marker) || !indexJs) indexJs = f;
    }
    if (f.startsWith("routes-")) {
      if (blob.includes(marker) || !routesJs) routesJs = f;
    }
  }
  if (!indexJs || !routesJs || !styles) return null;
  return { dir, indexJs, routesJs, styles, hasMarker };
}

function applyAssets(info) {
  for (const dest of dests) {
    if (!existsSync(dest)) continue;
    const assetsDest = join(dest, "assets");
    mkdirSync(assetsDest, { recursive: true });
    for (const f of readdirSync(assetsDest)) {
      if (/\.(js|css)$/.test(f)) rmSync(join(assetsDest, f), { force: true });
    }
    for (const f of [info.indexJs, info.routesJs, info.styles]) {
      cpSync(join(info.dir, f), join(assetsDest, f));
    }
    const htmlPath = join(dest, "index.html");
    if (!existsSync(htmlPath)) continue;
    let html = readFileSync(htmlPath, "utf8");
    html = html
      .replace(/\/assets\/index-[A-Za-z0-9_-]+\.js/g, `/assets/${info.indexJs}`)
      .replace(/\/assets\/routes-[A-Za-z0-9_-]+\.js/g, `/assets/${info.routesJs}`)
      .replace(/\/assets\/styles-[A-Za-z0-9_-]+\.css/g, `/assets/${info.styles}`);
    if (!html.includes(info.indexJs) || !html.includes(info.routesJs) || !html.includes(info.styles)) {
      throw new Error(`index.html hash rewrite failed for ${dest}`);
    }
    writeFileSync(htmlPath, html);
    console.log("updated", dest, info.indexJs, info.routesJs, info.styles);
  }
}

const before = assetDir();
console.log("starting vite build, current", before);

const child = spawn("npx", ["vite", "build"], {
  cwd: root,
  env: {
    ...process.env,
    NODE_OPTIONS: "--max-old-space-size=1024",
    SKIP_NITRO: "1",
  },
  stdio: ["ignore", "pipe", "pipe"],
});

let log = "";
child.stdout.on("data", (d) => {
  const s = d.toString();
  log += s;
  process.stdout.write(s);
});
child.stderr.on("data", (d) => {
  const s = d.toString();
  log += s;
  process.stderr.write(s);
});

let readySince = 0;
const poll = setInterval(() => {
  const info = assetDir();
  if (!info?.hasMarker) return;
  if (!readySince) {
    readySince = Date.now();
    console.log("client assets with reader marker seen", info);
    return;
  }
  if (Date.now() - readySince > 2500) {
    console.log("client assets stable — stopping SSR");
    child.kill("SIGTERM");
    setTimeout(() => child.kill("SIGKILL"), 1200);
  }
}, 800);

const code = await new Promise((resolve) => {
  child.on("exit", (c) => resolve(c));
});
clearInterval(poll);

const info = assetDir();
if (!info?.hasMarker) {
  console.error("build did not produce reader client assets", { code, info, tail: log.slice(-800) });
  process.exit(1);
}
applyAssets(info);
