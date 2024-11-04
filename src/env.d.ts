/// <reference path="../.astro/types.d.ts" />
/// <reference types="@clerk/astro/env" />
interface Window {
  Alpine: import("alpinejs").Alpine;
}
interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
