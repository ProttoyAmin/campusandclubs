import { PassThrough, Readable } from "node:stream";
import type { Request as ExpressRequest, Response as ExpressResponse } from "express";
import type { ServerEntry } from "./contract.ts";
import { isBot, toWebRequest } from "./web-request.ts";

/** Abort rendering if Suspense boundaries never settle. */
const ABORT_AFTER_MS = 10_000;

export interface RenderDocumentArgs {
    req: ExpressRequest;
    res: ExpressResponse;
    /** Template after Vite's transformIndexHtml (dev) or the built file (prod). */
    template: string;
    entry: ServerEntry;
    onError?: (error: unknown) => void;
}

/**
 * Turn one document request into a streamed HTML response:
 * redirects/raw responses pass through; otherwise status, <head>, the React
 * stream and the serialized query cache are written in order.
 */
export async function renderDocument({
    req,
    res,
    template,
    entry,
    onError = console.error,
}: RenderDocumentArgs): Promise<void> {
    const request = toWebRequest(req, res);
    const result = await entry.render(request, { waitForAll: isBot(req) });

    if (result.kind === "response") {
        await sendWebResponse(res, result.response);
        return;
    }

    const [start, end] = template
        .replace("<!--app-head-->", result.head)
        .split("<!--app-html-->") as [string, string];
    const tail = end.replace("<!--app-state-->", result.stateScript);

    let didError = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const stream = result.stream({
        onReady(react) {
            res.status(didError ? 500 : result.status);
            res.set({
                "Content-Type": "text/html; charset=utf-8",
                // Personalised HTML + dehydrated private data: never cache publicly.
                "Cache-Control": "private, no-store",
                Vary: "Cookie",
            });
            res.write(start);

            const body = new PassThrough();
            body.on("data", (chunk) => res.write(chunk));
            body.on("end", () => {
                res.end(tail);
                clearTimeout(timer);
                result.dispose();
            });
            react.pipe(body);
        },
        onShellError(error) {
            clearTimeout(timer);
            result.dispose();
            onError(error);
            if (!res.headersSent) {
                res.status(500).set("Content-Type", "text/html").end("<h1>Something went wrong</h1>");
            }
        },
        onError(error) {
            didError = true;
            onError(error);
        },
    });

    timer = setTimeout(() => stream.abort(), ABORT_AFTER_MS);
    res.on("close", () => {
        if (!res.writableFinished) {
            clearTimeout(timer);
            stream.abort();
            result.dispose();
        }
    });
}

async function sendWebResponse(res: ExpressResponse, response: Response): Promise<void> {
    const location = response.headers.get("Location");
    if (location && response.status >= 300 && response.status < 400) {
        res.redirect(response.status, location);
        return;
    }

    res.status(response.status);
    response.headers.forEach((value, key) => res.append(key, value));
    if (!response.body) {
        res.end();
        return;
    }
    Readable.fromWeb(response.body as import("node:stream/web").ReadableStream).pipe(res);
}
