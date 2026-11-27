/**
 * Server render entry for the new SSR pipeline (loaded by `server/`).
 *
 * Every call owns its own QueryClient and route objects, so nothing about
 * one visitor can leak into another visitor's HTML.
 */
import "./App.css";
import { StrictMode } from "react";
import { renderToPipeableStream, type PipeableStream } from "react-dom/server";
import {
    createStaticHandler,
    createStaticRouter,
    StaticRouterProvider,
} from "react-router-dom";
import { dehydrate } from "@tanstack/react-query";

import { createQueryClient } from "./config/query-client";
import { serializeDehydratedState } from "./config/dehydration";
import { AppProviders } from "./providers/app-providers";
import { ThemeProvider } from "./providers/theme-provider";
import {
    createAppRoutes,
    renderMetaTags,
    resolveMeta,
    resolveStatus,
    type MetaMatch,
    type RouteRuntime,
} from "./router";
import type { RenderFn } from "../server/contract";

export const render: RenderFn = async (request, options = {}) => {
    // 1. Request-scoped runtime: a fresh cache for exactly this visitor.
    const queryClient = createQueryClient();
    const runtime: RouteRuntime = { env: "server", queryClient, request };

    // 2. Match the URL and run the matched loaders (they prime `queryClient`).
    const { query, dataRoutes } = createStaticHandler(createAppRoutes(runtime));
    const context = await query(request);

    // 3. Redirects and raw responses short-circuit rendering.
    if (context instanceof Response) {
        queryClient.clear();
        return { kind: "response", response: context };
    }

    // 4. Status + <head> from the same matches the page will render.
    const matches: MetaMatch[] = context.matches.map((m) => ({
        handle: m.route.handle,
        params: m.params,
        pathname: m.pathname,
        data: context.loaderData?.[m.route.id],
    }));
    const status =
        context.statusCode !== 200 ? context.statusCode : (resolveStatus(matches) ?? 200);
    const head = renderMetaTags(resolveMeta(matches));

    // 5. Snapshot the cache the loaders produced (successful queries only).
    const stateScript = serializeDehydratedState(dehydrate(queryClient));

    const router = createStaticRouter(dataRoutes, context);
    const app = (
        <AppProviders queryClient={queryClient}>
            <StrictMode>
                <ThemeProvider>
                    <StaticRouterProvider router={router} context={context} />
                </ThemeProvider>
            </StrictMode>
        </AppProviders>
    );

    return {
        kind: "document",
        status,
        head,
        stateScript,
        dispose: () => queryClient.clear(),
        stream(callbacks) {
            const ready = () => queueMicrotask(() => callbacks.onReady(stream));
            const stream: PipeableStream = renderToPipeableStream(app, {
                onShellReady() {
                    if (!options.waitForAll) ready();
                },
                onAllReady() {
                    if (options.waitForAll) ready();
                },
                onShellError: callbacks.onShellError,
                onError: callbacks.onError,
            });
            return stream;
        },
    };
};
