import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tailwindScrollbar from "tailwind-scrollbar";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), tailwindScrollbar],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  // Site is served from the custom domain root.
  base: "/",
  server: {
    proxy: {
      // Forward API calls to the separately-deployed Cloudflare Worker in dev.
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
});
