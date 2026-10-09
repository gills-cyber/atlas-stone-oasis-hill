import { cpSync, mkdirSync, existsSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { renderIosMobileconfig } from "./grok-pwa-shared.mjs";

const root = process.cwd();
const web = join(root, "desktop-web");
const staging = join(root, "dist-desktop", "ios-staging");
const out = join(root, "dist-desktop", "PanelFox-iOS.zip");
if (!existsSync(join(web, "index.html"))) {
  console.error("desktop-web missing — run pack-desktop first");
  process.exit(1);
}

if (existsSync(staging)) rmSync(staging, { recursive: true, force: true });
mkdirSync(join(staging, "PanelFox"), { recursive: true });
cpSync(web, join(staging, "PanelFox", "www"), { recursive: true });

writeFileSync(
  join(staging, "PanelFox", "How to install on iPhone.txt"),
  `PanelFox for iPhone
===================

PanelFox installs to your Home Screen and opens full-screen
like any other iPhone app (no Safari address bar).

Install (recommended)
---------------------
1. On iPhone, open PanelFox in Safari.
2. Tap the Share button (square with an arrow).
3. Tap Add to Home Screen.
4. Tap Add.

PanelFox appears on the Home Screen with its own icon. Tap it to launch.

Profile install
---------------
Open "Install PanelFox.mobileconfig" on the iPhone, then Allow the profile
in Settings → Profile Downloaded.

The www folder is the studio itself if you host it on your own site.
`,
);

writeFileSync(
  join(staging, "PanelFox", "Install PanelFox.html"),
  `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
  <meta name="apple-mobile-web-app-capable" content="yes"/>
  <meta name="apple-mobile-web-app-title" content="PanelFox"/>
  <title>Install PanelFox on iPhone</title>
  <style>
    body { margin: 0; min-height: 100dvh; display: grid; place-items: center; font-family: system-ui, sans-serif; background: #ececee; color: #161412; }
    main { max-width: 22rem; padding: 1.5rem; }
    h1 { font-size: 1.4rem; margin: 0 0 0.6rem; }
    ol { padding-left: 1.2rem; line-height: 1.55; }
    a { display: inline-flex; margin-top: 1rem; min-height: 44px; align-items: center; padding: 0 16px; border-radius: 10px; background: #161412; color: #f3eee6; text-decoration: none; font-weight: 650; }
  </style>
</head>
<body>
  <main>
    <h1>PanelFox for iPhone</h1>
    <ol>
      <li>Open this studio in <b>Safari</b> (not in-app browsers).</li>
      <li>Tap Share — the square with the arrow.</li>
      <li>Tap <b>Add to Home Screen</b>, then Add.</li>
    </ol>
    <a href="Install PanelFox.mobileconfig">Install Home Screen icon</a>
  </main>
</body>
</html>
`,
);

writeFileSync(
  join(staging, "PanelFox", "Install PanelFox.mobileconfig"),
  renderIosMobileconfig("", "PanelFox"),
);

const icon = join(root, "public/__grok/icon-180.png");
if (existsSync(icon)) cpSync(icon, join(staging, "PanelFox", "icon.png"));

if (existsSync(out)) rmSync(out);
execFileSync("python3", [
  "-c",
  `
import zipfile, os
root = ${JSON.stringify(join(staging, "PanelFox"))}
out = ${JSON.stringify(out)}
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
    for dirpath, _, files in os.walk(root):
        for name in files:
            full = os.path.join(dirpath, name)
            z.write(full, os.path.relpath(full, os.path.dirname(root)))
print("wrote", out, os.path.getsize(out))
`,
]);
console.log("iOS package ready", { bytes: readFileSync(out).length });
