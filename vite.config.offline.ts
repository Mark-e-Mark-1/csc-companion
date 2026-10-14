import path from "node:path"
import { fileURLToPath } from "node:url"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { viteSingleFile } from "vite-plugin-singlefile"

const root = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  base: "./",
  plugins: [react(), viteSingleFile()],
  resolve: {
    alias: {
      "virtual:pwa-register": path.join(root, "src/pwa-stub.ts"),
    },
  },
  build: {
    outDir: "dist-offline",
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
  },
})
