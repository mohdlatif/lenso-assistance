// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";

import tailwind from "@astrojs/tailwind";

import vercel from "@astrojs/vercel/serverless";
import clerk from "@clerk/astro";

// https://astro.build/config
export default defineConfig({
  integrations: [clerk(), react(), tailwind()],
  output: "server",
  adapter: vercel(),
});
