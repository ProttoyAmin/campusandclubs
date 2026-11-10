/**
 * SSR entry — called per request by server.ts.
 *
 * Per-request flow:
 *   1. Build a fresh QueryClient (never reuse between requests).
 *   2. Compile route tree → static handler → run router.query() to match.
 *   3. Render the React tree to a stream via renderToPipeableStream.
 *   4. After the shell is ready, dehydrate the query client and
 *      serialize it + computed meta into the HTML template.
 */
import "./App.css";
import React from "react";
import { renderToPipeableStream, type PipeableStream } from "react-dom/server";
import { StaticRouterProvider } from "react-router-dom";
import { AppProviders } from "./providers/app-providers";
import { ThemeProvider } from "./providers/theme-provider";
import { StrictMode } from "react";
import { appRoutes } from "./router/routes.tree";
import { createServerRouter, dehydrateState, type ServerRouter } from "./lib/router/server";
import { serializeDehydratedState } from "./lib/router/dehydrated-state";
import { renderMeta, withAppName, type PageMeta } from "./lib/router/meta";

const DEFAULT_META: PageMeta = { title: withAppName("Campus & Clubs") };

interface RenderArgs {
  url: string;
  onShellReady: (
    stream: PipeableStream,
    extra: {
      dehydratedStateScript: string;
      metaTags: string;
      status: number;
    },
  ) => void;
  onShellError: (error: unknown) => void;
  onError?: (error: unknown) => void;
}

export async function render({ url, onShellReady, onShellError, onError }: RenderArgs) {
  let state: ServerRouter;
  try {
    state = await createServerRouter(url, appRoutes);
  } catch (e: unknown) {
    if (e instanceof Response) throw e; // redirect/404 handled by server.ts
    onShellError(e);
    return;
  }

  const { queryClient, router, context } = state;

  // Walk matched routes to pick a meta for <head>. React-router data
  // routes expose extra keys we attach in `compileTree` (like `meta`)
  // under the route object. Walk deepest → shallowest and pick the first
  // route that defines `meta`.
  let meta: PageMeta = DEFAULT_META;
  for (let i = context.matches.length - 1; i >= 0; i--) {
    const routeMeta = (context.matches[i].route as { meta?: PageMeta }).meta;
    if (routeMeta) {
      meta = routeMeta;
      break;
    }
  }

  let didError = false;

  const stream = renderToPipeableStream(
    <StrictMode>
      <AppProviders queryClient={queryClient}>
        <ThemeProvider>
          <StaticRouterProvider router={router} context={context} />
        </ThemeProvider>
      </AppProviders>
    </StrictMode>,
    {
      onShellReady() {
        // Dehydrate AFTER the shell rendered — loaders that ran during
        // render will have populated the cache.
        const dehydrated = dehydrateState(queryClient);
        const dehydratedScript = serializeDehydratedState(dehydrated);
        const metaTags = renderMeta(meta);
        queueMicrotask(() =>
          onShellReady(stream, {
            dehydratedStateScript: dehydratedScript,
            metaTags,
            status: didError ? 500 : (context.statusCode ?? 200),
          }),
        );
      },
      onShellError(error) {
        onShellError(error);
      },
      onError(error) {
        didError = true;
        onError?.(error);
      },
    },
  );
}
