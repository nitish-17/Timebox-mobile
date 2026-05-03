import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icons.svg"],
      manifest: {
        name: "System",
        short_name: "System",
        description: "Mobile-optimized personal planner",
        theme_color: "#020617",
        background_color: "#020617",
        display: "standalone",
        orientation: "portrait",
        start_url: "/Timebox-mobile/",
        scope: "/Timebox-mobile/",
        icons: [
          {
            src: "favicon.svg",
            sizes: "192x192",
            type: "image/svg+xml",
          },
          {
            src: "favicon.svg",
            sizes: "512x512",
            type: "image/svg+xml",
          },
          {
            src: "favicon.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  base: "/Timebox-mobile/",
});
