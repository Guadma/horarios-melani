import { defineConfig } from "vite";

// Config mínima para un proyecto vanilla HTML/CSS/JS
export default defineConfig({
  build: {
    outDir: "dist",
    sourcemap: false
  }
});
