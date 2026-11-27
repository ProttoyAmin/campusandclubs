/**
 * New SSR server. Runs alongside the existing `server.ts`; nothing here
 * replaces it until you switch the scripts over.
 *
 *   dev:   pnpm dev:next                (Vite middleware + HMR)
 *   prod:  pnpm build:next && pnpm start:next
 *
 * Env:
 *   VITE_WEB_PORT   port (default 3000)
 *   PUBLIC_ORIGIN   e.g. https://campusandclubs.com (used for absolute URLs)
 *   TRUST_PROXY     Express "trust proxy" value when behind a proxy, e.g. "1"
 */
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import express, { type NextFunction, type Request, type Response } from "express";
import type { ViteDevServer } from "vite";
import type { ServerEntry } from "./contract.ts";
import { renderDocument } from "./render-document.ts";
import { isDocumentRequest } from "./web-request.ts";

const isProduction =
    process.env.NODE_ENV === "production" || process.argv.includes("--production");
const PORT = Number(process.env.VITE_WEB_PORT || 3000);

const ROOT = path.resolve(import.meta.dirname, "..");
const TEMPLATE_PATH = path.join(ROOT, "server", "template.html");
const DIST = path.join(ROOT, "dist", "next");

async function createServer() {
    const app = express();
    app.disable("x-powered-by");
    if (process.env.TRUST_PROXY) app.set("trust proxy", parseTrustProxy(process.env.TRUST_PROXY));

    let vite: ViteDevServer | undefined;
    let loadTemplate: (url: string) => Promise<string>;
    let loadEntry: () => Promise<ServerEntry>;

    if (!isProduction) {
        const { createServer: createViteServer } = await import("vite");
        console.log("root", ROOT)
        vite = await createViteServer({
            root: ROOT,
            server: { middlewareMode: true },
            appType: "custom",
        });
        app.use(vite.middlewares);

        // Re-read and re-transform per request so template edits and HMR apply.
        loadTemplate = async (url) =>
            vite!.transformIndexHtml(url, await fs.readFile(TEMPLATE_PATH, "utf-8"));
        loadEntry = () => vite!.ssrLoadModule("/src/entry.server.tsx") as Promise<ServerEntry>;
    } else {
        const clientDir = path.join(DIST, "client");
        app.use(
            "/assets",
            express.static(path.join(clientDir, "assets"), { immutable: true, maxAge: "1y" }),
        );
        app.use(express.static(clientDir, { index: false }));

        const template = await fs.readFile(path.join(clientDir, "server", "template.html"), "utf-8");
        const entryUrl = pathToFileURL(path.join(DIST, "server", "entry.server.js")).href;
        const entry = (await import(entryUrl)) as ServerEntry;
        loadTemplate = async () => template;
        loadEntry = async () => entry;
    }

    app.use(async (req: Request, res: Response, next: NextFunction) => {
        if (!isDocumentRequest(req)) return next();
        try {
            const [template, entry] = await Promise.all([
                loadTemplate(req.originalUrl),
                loadEntry(),
            ]);
            await renderDocument({ req, res, template, entry });
        } catch (error) {
            if (error instanceof Error) vite?.ssrFixStacktrace(error);
            next(error);
        }
    });

    app.listen(PORT, () => {
        console.log(
            `[next] ${isProduction ? "production" : "development"} SSR on http://localhost:${PORT}`,
        );
    });
}

function parseTrustProxy(value: string): boolean | number | string {
    if (value === "true") return true;
    if (value === "false") return false;
    const n = Number(value);
    return Number.isInteger(n) ? n : value;
}

void createServer();
