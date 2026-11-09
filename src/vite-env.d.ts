/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_APP_ENV: "development" | "production" | string;
  readonly VITE_ENABLE_DEV_AUTOFILL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

