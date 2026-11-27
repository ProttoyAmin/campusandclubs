/**
 * Build config for the new SSR pipeline (server/ + src/entry.*.tsx).
 * Extends vite.config.ts; only the build input/output differ.
 *
 *   client: vite build --config vite.next.config.ts
 *   server: vite build --config vite.next.config.ts --ssr src/entry.server.tsx
 */
import { defineConfig, mergeConfig, type UserConfig } from "vite";
import base from "./vite.config.ts";

export default defineConfig((env) => {
    const baseConfig = (typeof base === "function" ? base(env) : base) as UserConfig;
    const isSsr = Boolean(env.isSsrBuild);

    return mergeConfig(baseConfig, {
        build: isSsr
            ? { outDir: "dist/next/server", emptyOutDir: true }
            : {
                  ssr: false,
                  outDir: "dist/next/client",
                  emptyOutDir: true,
                  rollupOptions: { input: "server/template.html" },
              },
    } satisfies UserConfig);
});
