import { Readable } from "node:stream";
import type { Request as ExpressRequest, Response as ExpressResponse } from "express";

/**
 * Convert an Express request into a Web `Request` for React Router.
 *
 * Unlike the current server.ts (which builds `new Request("http://localhost:3000" + url)`),
 * this keeps the method, every header (including Cookie), the body for
 * non-GET requests, and aborts when the client disconnects.
 */
export function toWebRequest(req: ExpressRequest, res: ExpressResponse): Request {
    const controller = new AbortController();
    res.on("close", () => {
        if (!res.writableFinished) controller.abort();
    });

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
        if (value === undefined) continue;
        if (Array.isArray(value)) value.forEach((v) => headers.append(key, v));
        else headers.set(key, value);
    }

    const init: RequestInit & { duplex?: "half" } = {
        method: req.method,
        headers,
        signal: controller.signal,
    };
    if (req.method !== "GET" && req.method !== "HEAD") {
        init.body = Readable.toWeb(req) as ReadableStream;
        init.duplex = "half";
    }

    return new Request(new URL(req.originalUrl, resolveOrigin(req)), init);
}

/**
 * Public origin for building absolute URLs.
 *
 * Prefer the configured `PUBLIC_ORIGIN`; otherwise fall back to the request,
 * which only reflects X-Forwarded-* when Express `trust proxy` is enabled.
 */
export function resolveOrigin(req: ExpressRequest): string {
    const configured = process.env.PUBLIC_ORIGIN;
    if (configured) return configured.replace(/\/$/, "");
    return `${req.protocol}://${req.get("host") ?? "localhost"}`;
}

/** Only real page navigations should be server-rendered. */
export function isDocumentRequest(req: ExpressRequest): boolean {
    if (req.method !== "GET" && req.method !== "HEAD") return false;
    const pathname = req.path;
    if (/\.[a-zA-Z0-9]+$/.test(pathname)) return false; // assets, source maps, favicons
    return req.headers.accept?.includes("text/html") ?? false;
}

const BOT_UA =
    /bot|crawler|spider|crawling|facebookexternalhit|slurp|bingpreview|linkedinbot|embedly|whatsapp|telegrambot|discordbot|twitterbot/i;

export function isBot(req: ExpressRequest): boolean {
    return BOT_UA.test(req.get("user-agent") ?? "");
}
