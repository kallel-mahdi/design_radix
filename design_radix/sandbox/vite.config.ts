import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5176,
    strictPort: true,
    watch: {
      // Ignore other project directories to reduce file watchers
      ignored: [
        "**/node_modules/**",
        "**/frontend-v2/**",
        "**/frontend-v2 copy/**",
        "**/landing-page/**",
        "**/backend/**",
        "**/.git/**",
      ],
    },
  },
});
