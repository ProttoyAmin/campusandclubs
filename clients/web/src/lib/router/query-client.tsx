/**
 * QueryClient factories & hydration helpers.
 *
 * The server must create ONE QueryClient per request so parallel
 * requests don't share cache (and don't leak data between users).
 *
 * The client creates a single persistent QueryClient and hydrates it
 * once from the dehydrated state embedded in the HTML by the server.
 */
import { QueryClient, QueryCache, dehydrate, HydrationBoundary, type DehydratedState } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { sessionKeys, ANONYMOUS_SESSION } from "@/features/auth/queries/session";

const DEFAULT_STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function createQueryClient(): QueryClient {
  const client: QueryClient = new QueryClient({
    queryCache: new QueryCache({
      onError(error, query) {
        if (
          isAxiosError(error) &&
          error.response?.status === 401 &&
          query.queryKey[0] !== sessionKeys.all[0]
        ) {
          // Any 401 outside the session query itself means the session
          // expired; flip session to anonymous so the app can redirect.
          client.setQueryData(sessionKeys.all, ANONYMOUS_SESSION);
        }
      },
    }),
    defaultOptions: {
      queries: {
        // Must be >0 with SSR, otherwise the client refetches immediately
        // after hydration, defeating the point of SSR.
        staleTime: DEFAULT_STALE_TIME,
        retry(_count, error) {
          const status = isAxiosError(error) ? error.response?.status : undefined;
          if (status && [401, 403, 404].includes(status)) return false;
          return _count < 1;
        },
      },
      mutations: { retry: false },
    },
  });
  return client;
}

/** Singleton client-side QueryClient. */
let clientSideQueryClient: QueryClient | null = null;

export function getClientQueryClient(): QueryClient {
  if (!clientSideQueryClient) {
    clientSideQueryClient = createQueryClient();
  }
  return clientSideQueryClient;
}

/** For tests / logout flows. */
export function resetClientQueryClient(): void {
  clientSideQueryClient = null;
}

export { dehydrate, HydrationBoundary };
export type { DehydratedState };
