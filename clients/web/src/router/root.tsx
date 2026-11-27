import { useEffect } from "react";
import { Outlet, useMatches } from "react-router-dom";
import { applyMeta, resolveMeta, type MetaMatch } from "./meta";

/**
 * Pathless root of the new route tree.
 *
 * It renders nothing visible; it exists so app-wide, router-aware concerns
 * (currently: keeping <head> in sync) live in exactly one place without
 * touching any existing layout.
 */
export default function RootRoute() {
    return (
        <>
            <RouteMetadata />
            <Outlet />
        </>
    );
}

/**
 * Keeps <title>/<meta> in sync after client navigations. The server already
 * wrote the same tags into the HTML via `renderMetaTags`, and this runs in an
 * effect, so the first render is identical on both sides (no hydration diff).
 */
export function RouteMetadata(): null {
    const matches = useMatches();

    useEffect(() => {
        const normalized: MetaMatch[] = matches.map((m) => ({
            handle: m.handle,
            params: m.params,
            pathname: m.pathname,
            data: m.loaderData,
        }));
        applyMeta(resolveMeta(normalized));
    }, [matches]);

    return null;
}
