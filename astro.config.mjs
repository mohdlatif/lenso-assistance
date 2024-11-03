// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";

import tailwind from "@astrojs/tailwind";
import alpine from "@astrojs/alpinejs";
import vercel from "@astrojs/vercel/serverless";
import clerk from "@clerk/astro";

// https://astro.build/config
export default defineConfig({
  site: "https://files.sendithere.co",
  integrations: [
    clerk({
      appearance: {
        layout: {
          unsafe_disableDevelopmentModeWarnings: true,
        },
      },
    }),
    alpine({ entrypoint: "/src/entrypoint" }),
    react(),
    tailwind(),
  ],
  output: "hybrid",
  adapter: vercel(),
});
