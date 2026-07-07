import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
  },
  build: {
    outDir: "dist-admin",
    rollupOptions: {
      input: path.resolve(__dirname, "index.admin.html"),
    },
  },
});
