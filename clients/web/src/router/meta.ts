import { APP_NAME } from "@/config/constants";
import type { MetaDescriptor, RouteHandle, RouteMeta } from "./types";

/**
 * Single source of truth for page metadata.
 *
 * Both the server (from the static handler context) and the browser (from
 * `useMatches()`) normalise their matches into `MetaMatch` and call
 * `resolveMeta()`, so SSR and client navigations always agree.
 */
export interface MetaMatch {
    handle?: unknown;
    params: Record<string, string | undefined>;
    pathname: string;
    data: unknown;
}

export const DEFAULT_META: RouteMeta = {
    title: APP_NAME,
    description: "Discover campus clubs, follow people and join the conversation.",
    robots: "index,follow",
};

/** `"Chats"` -> `"Chats | Campus and Clubs"` */
export function pageTitle(title: string): string {
    return title === APP_NAME ? title : `${title} | ${APP_NAME}`;
}

/** Combine two descriptors on one route; `extra` wins on conflicts. */
export function extendMeta(base: MetaDescriptor, extra: MetaDescriptor): MetaDescriptor {
    return (args) => ({
        ...(typeof base === "function" ? base(args) : base),
        ...(typeof extra === "function" ? extra(args) : extra),
    });
}

/** Merge each matched route's meta from root to leaf; deeper routes win. */
export function resolveMeta(matches: MetaMatch[]): RouteMeta {
    let meta: RouteMeta = { ...DEFAULT_META };

    for (const match of matches) {
        const descriptor = (match.handle as RouteHandle | undefined)?.meta;
        if (!descriptor) continue;

        const partial =
            typeof descriptor === "function"
                ? safely(() =>
                    descriptor({
                        params: match.params,
                        data: match.data,
                        pathname: match.pathname,
                    }),
                )
                : descriptor;

        if (partial) meta = { ...meta, ...stripUndefined(partial) };
    }

    return meta;
}

/** HTTP status forced by the deepest route that declares one. */
export function resolveStatus(matches: MetaMatch[]): number | undefined {
    for (let i = matches.length - 1; i >= 0; i--) {
        const status = (matches[i]!.handle as RouteHandle | undefined)?.status;
        if (status) return status;
    }
    return undefined;
}

/* ------------------------------ server output ----------------------------- */

/** Render `<head>` tags for SSR. Every value is escaped. */
export function renderMetaTags(meta: RouteMeta): string {
    const tags = [`<title>${escapeHtml(meta.title)}</title>`];
    const named: Array<[string, string | undefined]> = [
        ["description", meta.description],
        ["keywords", meta.keywords],
        ["robots", meta.robots],
    ];
    const property: Array<[string, string | undefined]> = [
        ["og:title", meta.title],
        ["og:description", meta.description],
        ["og:image", meta.image],
        ["og:url", meta.canonical],
    ];

    for (const [name, content] of named) {
        if (content) tags.push(`<meta name="${name}" content="${escapeHtml(content)}" />`);
    }
    for (const [prop, content] of property) {
        if (content) tags.push(`<meta property="${prop}" content="${escapeHtml(content)}" />`);
    }
    if (meta.canonical) {
        tags.push(`<link rel="canonical" href="${escapeHtml(meta.canonical)}" />`);
    }
    return tags.join("\n    ");
}

/* ----------------------------- browser output ----------------------------- */

/** Apply meta to `document.head` after a client navigation. */
export function applyMeta(meta: RouteMeta): void {
    document.title = meta.title;
    setMeta("name", "description", meta.description);
    setMeta("name", "keywords", meta.keywords);
    setMeta("name", "robots", meta.robots);
    setMeta("property", "og:title", meta.title);
    setMeta("property", "og:description", meta.description);
    setMeta("property", "og:image", meta.image);
    setMeta("property", "og:url", meta.canonical);
    setCanonical(meta.canonical);
}

function setMeta(attr: "name" | "property", key: string, content: string | undefined) {
    let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
    if (!content) {
        el?.remove();
        return;
    }
    if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
    }
    el.setAttribute("content", content);
}

function setCanonical(href: string | undefined) {
    let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!href) {
        el?.remove();
        return;
    }
    if (!el) {
        el = document.createElement("link");
        el.rel = "canonical";
        document.head.appendChild(el);
    }
    el.href = href;
}

/* --------------------------------- helpers -------------------------------- */

function safely<T>(fn: () => T): T | undefined {
    try {
        return fn();
    } catch (error) {
        console.error("[router/meta] meta function threw", error);
        return undefined;
    }
}

function stripUndefined<T extends object>(obj: T): Partial<T> {
    return Object.fromEntries(
        Object.entries(obj).filter(([, v]) => v !== undefined),
    ) as Partial<T>;
}

export function escapeHtml(s: string): string {
    return s
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}
