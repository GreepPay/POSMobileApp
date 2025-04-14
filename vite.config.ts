/// <reference types="vitest" />

import legacy from "@vitejs/plugin-legacy";
import vue from "@vitejs/plugin-vue";
import path from "path";
import { defineConfig } from "vite";

import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.VITE_APP_BASE_URL || "/",
  plugins: [vue(), legacy(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
  },
});
