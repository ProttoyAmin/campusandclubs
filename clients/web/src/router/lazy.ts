import { matchRoutes, type RouteObject } from "react-router-dom";

/**
 * Resolve the `lazy` route modules that match the current URL *before* the
 * browser router is created.
 *
 * The server already rendered those pages, so if the client had to wait for
 * them during hydration React Router would render nothing (or a fallback)
 * first, causing a hydration mismatch. This is the pattern from React
 * Router's "custom server rendering" guide.
 */
export async function resolveInitialLazyRoutes(
    routes: RouteObject[],
    location: { pathname: string; search?: string; hash?: string },
): Promise<void> {
    const matches = matchRoutes(routes, location) ?? [];

    await Promise.all(
        matches.map(async ({ route }) => {
            const lazy = route.lazy;
            if (typeof lazy !== "function") return;
            const resolved = await lazy();
            Object.assign(route, { ...resolved, lazy: undefined });
        }),
    );
}
