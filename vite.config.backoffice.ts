import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const adminHtml = path.resolve(__dirname, "index.admin.html");

/** Vite dev server só serve index.html na raiz; redireciona pro HTML do backoffice. */
function adminIndexPlugin(): Plugin {
  return {
    name: "admin-index-fallback",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url === "/" || req.url === "/index.html") {
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
  },
  build: {
    outDir: "dist-admin",
    rollupOptions: {
      input: adminHtml,
    },
  },
});
