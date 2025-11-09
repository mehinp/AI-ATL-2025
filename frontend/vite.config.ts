import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const liveStreamProxyTarget =
  process.env.VITE_STREAM_PROXY_TARGET ??
  "https://sunshine-laughable-unbriefly.ngrok-free.dev";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "dist", // ✅ relative path so Railway can find it
    emptyOutDir: true,
  },
  server: {
    cors: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    proxy: {
      "/live-stream": {
        target: liveStreamProxyTarget,
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/live-stream/, ""),
      },
    },
  },
});
