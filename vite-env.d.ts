interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
  readonly DEV: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
