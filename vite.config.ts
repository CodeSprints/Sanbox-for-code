import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

const host = process.env.TAURI_DEV_HOST;
const devPort = Number(process.env.PORT ?? 1420);

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  clearScreen: false,
  server: {
    host: host ?? "0.0.0.0",
    port: devPort,
    strictPort: false,
    allowedHosts: true,
    hmr: host ? { protocol: "ws", host, port: devPort + 1 } : undefined,
    watch: {
      ignored: ["**/src-tauri/**", "**/docs/**"],
    },
  },
  preview: {
    host: "0.0.0.0",
    port: devPort,
    allowedHosts: true,
  },
  envPrefix: ["VITE_", "TAURI_ENV_"],
  build: {
    target: process.env.TAURI_ENV_PLATFORM === "windows" ? "chrome105" : "es2022",
    minify: process.env.TAURI_ENV_DEBUG ? false : "esbuild",
    sourcemap: Boolean(process.env.TAURI_ENV_DEBUG),
    cssTarget: "chrome105",
  },
});
