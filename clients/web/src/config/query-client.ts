import { sessionKeys, ANONYMOUS_SESSION } from "@/features/auth/queries/session";
import { QueryClient, QueryCache, dehydrate, HydrationBoundary, type DehydratedState } from "@tanstack/react-query";
import { isAxiosError } from "axios";


let clientSideQueryClient: QueryClient | null = null;

// export const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       staleTime: 5 * 60 * 1000,
//       retry: 1,
//     },
//     mutations: {
//       retry: 1,
//     },
//   },
// });


export function createQueryClient() {
  const client: QueryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (
          isAxiosError(error) &&
          error.response?.status === 401 &&
          query.queryKey[0] !== sessionKeys.all[0]
        ) {
          client.setQueryData(sessionKeys.all, ANONYMOUS_SESSION)
        }
      }
    }),
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,  // must be > 0 with SSR or the client refetches on hydrate
        retry: (count, error) => {
          const status = isAxiosError(error) ? error.response?.status : undefined;
          if (status && [401, 403, 404].includes(status)) return false;
          return count < 1;
        }
      },
      mutations: { retry: false }
    }
  })

  return client
}

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

export const queryClient = createQueryClient()
export { dehydrate, HydrationBoundary };
export type { DehydratedState };