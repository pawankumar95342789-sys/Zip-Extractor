import { defineConfig } from "vite";

// Kept for projects that migrate this static bundle back to a Vite source tree.
// GitHub Pages requires relative URLs when the site is served from a repository path.
export default defineConfig({
  base: "./",
});