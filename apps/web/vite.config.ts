import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";


export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [reactRouter(), tailwindcss()],
    server: {
      port: Number(env.VITE_WEB_PORT),
    },
    resolve: {
      tsconfigPaths: true,
    }
  };
});