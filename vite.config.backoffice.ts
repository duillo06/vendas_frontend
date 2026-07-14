import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const adminHtml = path.resolve(__dirname, "index.admin.html");

/** Fallback SPA — sem isso, F5 em /categorias etc. dá 404 no dev server. */
function adminIndexPlugin(): Plugin {
  return {
    name: "admin-index-fallback",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = (req.url ?? "").split("?")[0];

        const isAsset =
          url.startsWith("/@") ||
          url.startsWith("/src/") ||
          url.startsWith("/node_modules/") ||
          url.startsWith("/api/") ||
          url.startsWith("/media/") ||
          /\.\w+$/.test(url);

        if (req.method !== "GET" || isAsset) {
          next();
          return;
        }

        if (url === "/" || url === "/index.html" || url === "/index.admin.html") {
          req.url = "/index.admin.html";
        } else {
          // Rotas do React Router (ex: /categorias, /pedidos/uuid)
          req.url = "/index.admin.html";
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), adminIndexPlugin()],
  define: {
    "import.meta.env.VITE_APP_TARGET": JSON.stringify("backoffice"),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5175,
    strictPort: true,
    host: true,
    // browser → mesma origem; Vite encaminha pro Django local
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8001",
        changeOrigin: true,
      },
      "/media": {
        target: "http://127.0.0.1:8001",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist-admin",
    rollupOptions: {
      input: adminHtml,
    },
  },
});
