/**
 * Client-side <head> synchronizer.
 *
 * After each navigation, walks the matched routes, resolves each one's
 * `meta` (static object or async function) and applies the nearest (deepest)
 * title/description.
 *
 * The server renders meta directly into HTML during SSR; this component
 * keeps <title> and <meta name="description"> in sync on client
 * navigations.
 */
import { useEffect } from "react";
import { useLocation, useMatches } from "react-router-dom";
import { applyMeta } from "./page";
import type { RouteMeta } from "@/router/types";

type ResolvedMatch = {
    id: string;
    params: Record<string, string | undefined>;
    data: unknown;
    handle?: unknown;
    route?: { meta?: RouteMeta | (() => RouteMeta | Promise<RouteMeta>) };
    meta?: RouteMeta | (() => RouteMeta | Promise<RouteMeta>);
};

function resolveMeta(match: ResolvedMatch): RouteMeta | null {
    const m = (match as any).route?.meta ?? (match as any).meta;
    if (!m) return null;
    if (typeof m === "function") {
        try {
            const result = m({ params: match.params, data: match.data });
            if (result instanceof Promise) return null; // async meta ignored on client nav for now
            return result;
        } catch {
            return null;
        }
    }
    return m;
}

export function MetaUpdater(): null {
    const matches = useMatches() as ResolvedMatch[];
    const { pathname } = useLocation();

    useEffect(() => {
        for (let i = matches.length - 1; i >= 0; i--) {
            const meta = resolveMeta(matches[i]);
            if (meta) {
                applyMeta({ title: meta.title, description: meta.description });
                return;
            }
        }
    }, [matches, pathname]);

    return null;
}
