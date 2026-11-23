/// <reference types="vite/client" />

declare const __BUILD_YEAR__: number

interface ImportMetaEnv {
  readonly VITE_FORMS_API_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
