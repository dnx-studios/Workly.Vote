/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL injected by Vite (set via BASE_PATH env var at build time). */
  readonly BASE_URL: string;
  /** External API server URL for static deployments (e.g. GitHub Pages). */
  readonly VITE_API_URL?: string;
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
