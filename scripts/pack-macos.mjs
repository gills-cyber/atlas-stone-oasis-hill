import { existsSync, mkdirSync, rmSync, writeFileSync, cpSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const dist = join(root, "dist-desktop");
const arm = join(dist, "PanelFox-macOS-arm64.zip");
const intel = join(dist, "PanelFox-macOS-x64.zip");
const out = join(dist, "PanelFox-macOS.zip");
const staging = join(dist, "macos-staging");

if (!existsSync(arm) || !existsSync(intel)) {
  console.error("Missing mac zip artifacts", { arm: existsSync(arm), intel: existsSync(intel) });
  process.exit(1);
}

if (existsSync(staging)) rmSync(staging, { recursive: true, force: true });
mkdirSync(join(staging, "Apple Silicon"), { recursive: true });
mkdirSync(join(staging, "Intel"), { recursive: true });

execFileSync("python3", [
  "-c",
  `
import zipfile, os, shutil
staging = ${JSON.stringify(staging)}
arm = ${JSON.stringify(arm)}
intel = ${JSON.stringify(intel)}
for src, dest in ((arm, os.path.join(staging, "Apple Silicon")), (intel, os.path.join(staging, "Intel"))):
    with zipfile.ZipFile(src) as z:
        z.extractall(dest)
`,
]);

cpSync(join(root, "electron/README-macOS.txt"), join(staging, "How to install on Mac.txt"));

if (existsSync(out)) rmSync(out);
execFileSync("python3", [
  "-c",
  `
import zipfile, os
root = ${JSON.stringify(staging)}
out = ${JSON.stringify(out)}
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
    for dirpath, _, files in os.walk(root):
        for name in files:
            full = os.path.join(dirpath, name)
            z.write(full, os.path.relpath(full, root))
print("wrote", out, os.path.getsize(out))
`,
]);
console.log("macOS package ready", { bytes: readFileSync(out).length });
