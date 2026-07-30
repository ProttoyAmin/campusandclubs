import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: Number(env.VITE_WEB_PORT),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src")
      },
    }
  };
});