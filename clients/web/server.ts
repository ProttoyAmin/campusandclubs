import fs from "node:fs";
import path from "node:path";
import express from "express";
import { createServer as createViteServer } from "vite";

async function createServer() {
  const app = express();
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "custom",
  });
}
