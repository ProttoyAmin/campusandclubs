import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "./schema/openapi.yaml",

  output: {
    path: "./generated",
    postProcess: ["prettier"],
  },

  plugins: [
    "@hey-api/client-fetch",
  ],
});