import { queryOptions } from "@tanstack/react-query";
import { authentication } from "../services/authentication";

export const ANONYMOUS_SESSION = { authenticated: false } as const;

export const sessionKeys = { all: ["session"] as const };

export const sessionQueryOptions = queryOptions({
    queryKey: sessionKeys.all,
    queryFn: () => authentication.check_session(),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
});