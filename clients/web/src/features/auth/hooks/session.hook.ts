import { useQuery } from "@tanstack/react-query";
import { authentication } from "../services/authentication";
import { storage } from "@/settings/storage/";

export const authKeys = {
  session: ["auth", "session"] as const,
};

export const useSession = () => {
  return useQuery({
    queryKey: authKeys.session,
    queryFn: () => authentication.checkSession(),
    staleTime: 1000 * 60 * 5, // 5 min, tune access token lifetime
    retry: false,
  });
};

/**
 * Exposes auth helpers for components.
 *
 * The API client interceptors (token getter + 401 refresh handler)
 * are wired up in the Authentication constructor at module load time,
 * so they work regardless of whether this hook is called.
 */
export const useAuth = () => {
  const getToken = () => storage.token.getAccessToken() ?? null;

  return { getToken };
};
