/**
 * Browser entry for the new SSR pipeline (referenced by server/template.html).
 *
 * Order matters:
 *   1. hydrate the TanStack cache the server serialized,
 *   2. resolve lazy route modules for the current URL,
 *   3. create the router (it picks up React Router's own hydration data),
 *   4. hydrateRoot with the same provider tree as entry.server.tsx.
 */
import "./App.css";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { hydrate, type DehydratedState } from "@tanstack/react-query";

// The browser keeps ONE QueryClient for the tab. We reuse the existing module
// instance because several hooks/layouts still import `queryClient` directly;
// once they use `useQueryClient()` this can become `getClientQueryClient()`.
import { queryClient } from "./config/query-client";
import { extractDehydratedState } from "./config/dehydration";
import { AppProviders } from "./providers/app-providers";
import { ThemeProvider } from "./providers/theme-provider";
import { createAppRoutes, resolveInitialLazyRoutes } from "./router";

async function boot() {
    const state = extractDehydratedState();
    if (state) hydrate(queryClient, state as DehydratedState);
    document.getElementById("__RQ_STATE__")?.remove();

    const routes = createAppRoutes({ env: "browser", queryClient });
    await resolveInitialLazyRoutes(routes, window.location);
    const router = createBrowserRouter(routes);

    hydrateRoot(
        document.getElementById("root")!,
        <AppProviders queryClient={queryClient}>
            <StrictMode>
                <ThemeProvider>
                    <RouterProvider router={router} />
                </ThemeProvider>
            </StrictMode>
        </AppProviders>,
    );
}

void boot();
