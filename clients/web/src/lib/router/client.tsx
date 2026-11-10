/**
 * Client-side entry: builds the singleton QueryClient, hydrates from
 * SSR state, creates the browser router, and mounts providers.
 */
import type { ReactElement } from "react";
import { createBrowserRouter, RouterProvider, type RouteObject } from "react-router-dom";
import { HydrationBoundary } from "@tanstack/react-query";
import { getClientQueryClient } from "./query-client";
import { AppProviders } from "@/providers/app-providers";
import { ThemeProvider } from "@/providers/theme-provider";
import { MetaUpdater } from "./meta-updater";

export function createClientApp(routes: RouteObject[], dehydratedState: unknown): ReactElement {
  const queryClient = getClientQueryClient();
  const router = createBrowserRouter(routes);

  return (
    <AppProviders queryClient={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <ThemeProvider>
          <MetaUpdater />
          <RouterProvider router={router} />
        </ThemeProvider>
      </HydrationBoundary>
    </AppProviders>
  );
}
