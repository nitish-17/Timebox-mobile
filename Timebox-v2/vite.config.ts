import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Timebox",
        short_name: "Timebox",
        description: "Deep Work & Hourly Planning",
        theme_color: "#020617",
        background_color: "#020617",
        display: "standalone",
        orientation: "portrait",
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
      devOptions: {
        enabled: true,
        suppressWarnings: true,
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split FullCalendar into its own chunk as it's the largest dependency
          if (id.includes("@fullcalendar")) {
            return "vendor-calendar";
          }
          // Split core libraries into a separate chunk
          if (
            id.includes("react") ||
            id.includes("dexie") ||
            id.includes("date-fns") ||
            id.includes("@dnd-kit")
          ) {
            return "vendor-core";
          }
        },
      },
    },
    // Increase the limit to 700 to silence the core vendor warning
    chunkSizeWarningLimit: 700,
  },
  // base: "/Timebox-v2/",
});
