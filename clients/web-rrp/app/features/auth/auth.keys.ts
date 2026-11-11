/**
 * React Query key factories for auth.
 *
 * Kept colocated with the feature — every hook/loader that touches auth
 * data MUST import keys from here so invalidation is type-safe and
 * centralized.
 */
export const authKeys = {
  all: ["auth"] as const,
  session: () => [...authKeys.all, "session"] as const,
  socialProviders: () => [...authKeys.all, "social"] as const,
};
