/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  readonly VITE_GATEWAY_URL: string;
  readonly VITE_GATEWAY_TOKEN: string;
  /** Base URL of the Visual Dictionary recognition proxy. Unset → offline mock. */
  readonly VITE_DICTIONARY_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
