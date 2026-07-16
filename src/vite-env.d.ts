interface ImportMetaEnv {
  readonly VITE_FOOTBALL_API_KEY?: string;
  readonly [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
