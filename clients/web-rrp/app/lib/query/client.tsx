/**
 * React Query client + provider.
 *
 * Server: fresh QueryClient per request (no cross-request leakage).
 * Client: single persistent QueryClient, hydrated from SSR state.
 *
 * Fill in the 401 → ANONYMOUS_SESSION handler once auth is wired.
 */
import { useState, type ReactNode } from "react";
import {
  QueryClient,
  QueryClientProvider,
  HydrationBoundary,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export const QUERY_STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: QUERY_STALE_TIME,
        retry: (count, error) => {
          // TODO: don't retry on 401/403/404 once auth is wired.
          return count < 1;
        },
      },
      mutations: { retry: false },
    },
  });
}

let clientSideQueryClient: QueryClient | null = null;

export function getClientQueryClient(): QueryClient {
  if (!clientSideQueryClient) {
    clientSideQueryClient = createQueryClient();
  }
  return clientSideQueryClient;
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => getClientQueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools buttonPosition="bottom-right" />
    </QueryClientProvider>
  );
}

export { HydrationBoundary };
