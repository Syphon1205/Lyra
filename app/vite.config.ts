import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// Renderer-only config. Electron main/preload are compiled separately by
// `tsc -p electron/tsconfig.json` (see package.json) since they run under
// Node/Electron's own module loader, not a bundler.
export default defineConfig({
  root: "src",
  base: "./",
  plugins: [react()],
  resolve: {
    alias: {
      "@shared": fileURLToPath(new URL("./shared", import.meta.url)),
    },
  },
  build: {
    outDir: "../dist/renderer",
    emptyOutDir: true,
  },
  server: {
    port: 5183,
    strictPort: true,
  },
});
