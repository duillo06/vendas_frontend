import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5174,
    strictPort: true,
    host: true,
    proxy: {
      // API + media na mesma origem do Vite (LAN / demo.localhost)
      "/api": {
        target: "http://127.0.0.1:8001",
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            // URLs absolutas de /media usam o Host do browser (:5174), não :8001
            if (req.headers.host) {
              proxyReq.setHeader("Host", req.headers.host);
            }
          });
        },
      },
      "/media": {
        target: "http://127.0.0.1:8001",
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.host) {
              proxyReq.setHeader("Host", req.headers.host);
            }
          });
        },
      },
    },
  },
});
