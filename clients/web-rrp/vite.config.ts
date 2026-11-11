import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import path from "node:path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = env.VITE_PUBLIC_API_URL || "http://localhost:8000";

  return {
    plugins: [reactRouter(), tailwindcss()],
    resolve: {
      alias: { "@": path.resolve(__dirname, "./app") },
      tsconfigPaths: true,
    },
    server: {
      port: Number(env.VITE_RRP_PORT ?? 3001),
      host: true,
      allowedHosts: true,
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
