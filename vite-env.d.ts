/**
 * @file vite-env.d.ts
 * This is a TypeScript declaration file. It's used to provide type definitions
 * for environment variables that are managed by Vite.
 * This allows us to use `import.meta.env` in our code with full TypeScript support
 * and autocompletion, preventing typos and improving code quality.
 */

interface ImportMetaEnv {
  // `VITE_API_KEY` is the environment variable used for the local development API key.
  // It's defined in the `.env` file. `readonly` ensures we don't accidentally try to modify it.
  readonly VITE_API_KEY: string;

  // `DEV` is a boolean flag provided by Vite that is `true` during development (`npm run dev`)
  // and `false` in production builds. This is crucial for our tree-shaking strategy.
  readonly DEV: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
