import { cpSync, mkdirSync, readdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";

const root = process.cwd();
const staticDir = join(root, ".vercel", "output", "static");
const dest = join(root, "desktop-web");
if (!existsSync(staticDir)) {
  console.error("Run npm run build first — no production static files.");
  process.exit(1);
}

if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
cpSync(staticDir, dest, { recursive: true });
rmSync(join(dest, "downloads"), { recursive: true, force: true });

const assets = readdirSync(join(dest, "assets"));
const indexJs = assets.find((f) => f.startsWith("index-") && f.endsWith(".js"));
const routesJs = assets.find((f) => f.startsWith("routes-") && f.endsWith(".js"));
const styles = assets.find((f) => f.startsWith("styles-") && f.endsWith(".css"));
if (!indexJs || !routesJs || !styles) {
  console.error("Missing client assets", { indexJs, routesJs, styles });
  process.exit(1);
}

function stripChrome(html) {
  return html
    .replace(/<script src="https:\/\/grok\.com\/grok-app-builder\/extensions\.js"[^>]*><\/script>/g, "")
    .replace(/<link rel="manifest"[^>]*>/g, "")
    .replace(/<link rel="apple-touch-icon"[^>]*>/g, "");
}

function isBootable(html) {
  return (
    html.length > 8000 &&
    html.includes(indexJs) &&
    html.includes(styles) &&
    /PanelFox/.test(html) &&
    /data-koma-menubar/.test(html)
  );
}

async function htmlFrom(port) {
  const res = await fetch(`http://127.0.0.1:${port}/`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = stripChrome(await res.text());
  if (!isBootable(html)) throw new Error("not production html");
  return html;
}

let html = "";
for (const port of [18769, 18768, 8081, 4173]) {
  try {
    html = await htmlFrom(port);
    console.log("captured SSR html from", port);
    break;
  } catch {
    /* next */
  }
}

if (!html) {
  const port = 18765;
  const viteBin = join(root, "node_modules", ".bin", "vite");
  const child = spawn(
    viteBin,
    ["preview", "--host", "127.0.0.1", "--port", String(port)],
    { cwd: root, stdio: "pipe", env: process.env },
  );
  try {
    const deadline = Date.now() + 25000;
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 400));
      try {
        html = await htmlFrom(port);
        console.log("captured SSR html from spawned", port);
        break;
      } catch {
        /* wait */
      }
    }
  } finally {
    child.kill("SIGTERM");
  }
}

if (!html || !isBootable(html)) {
  console.error("Could not capture bootable SSR HTML. Refusing to pack a blank desktop app.");
  process.exit(1);
}

writeFileSync(join(dest, "index.html"), html);
console.log("desktop-web packed", { indexJs, routesJs, styles, htmlBytes: html.length });
