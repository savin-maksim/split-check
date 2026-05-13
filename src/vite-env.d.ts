/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RECEIPT_SCAN_FUNCTION_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
