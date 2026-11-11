/**
 * Session query — the single source of truth for "is the user logged in".
 *
 * Consumed by <Guard/>, pages, and any component that needs auth state.
 * Leave the queryFn empty; it will call authHttp.checkSession() when wired.
 */
// import { useQuery } from "@tanstack/react-query";
// import { authKeys } from "../auth.keys";
// import { authHttp } from "../auth.http";

export function useSession() {
  // return useQuery({
  //   queryKey: authKeys.session(),
  //   queryFn: () => authHttp.checkSession(),
  //   staleTime: 5 * 60 * 1000,
  //   retry: false,
  // });
  return { data: null, isLoading: false };
}
