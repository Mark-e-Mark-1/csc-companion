import { copyFile, mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { execFile } from "node:child_process"
import { promisify } from "node:util"

const execFileAsync = promisify(execFile)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const staging = path.join(root, "release", "staging")
const zipPath = path.join(root, "release", "CSC-Companion.zip")

await mkdir(path.join(staging, "icons"), { recursive: true })
await copyFile(path.join(root, "dist-offline", "index.html"), path.join(staging, "index.html"))
await copyFile(path.join(root, "public", "favicon.svg"), path.join(staging, "favicon.svg"))
await copyFile(path.join(root, "public", "icons", "icon-192.png"), path.join(staging, "icons", "icon-192.png"))
await writeFile(
  path.join(staging, "HOW-TO-OPEN.txt"),
  `CSC Clinical Companion — offline copy

Double-click index.html. It opens in your browser. You do not need a server
and you do not need an internet connection for the app itself.

Do not enter patient information. Nothing you select is saved.

This zip is a frozen copy. To change the clinical text, edit the content
folder in the project and run npm run zip:offline. The README explains the files.
`,
)

await execFileAsync("python3", [
  "-c",
  `
import pathlib, zipfile
staging = pathlib.Path(${JSON.stringify(staging)})
dest = pathlib.Path(${JSON.stringify(zipPath)})
dest.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(dest, "w", compression=zipfile.ZIP_DEFLATED) as zf:
    for name in ("index.html", "HOW-TO-OPEN.txt", "favicon.svg", "icons/icon-192.png"):
        zf.write(staging / name, arcname=name)
print(dest, dest.stat().st_size)
`,
])

console.log(zipPath)
