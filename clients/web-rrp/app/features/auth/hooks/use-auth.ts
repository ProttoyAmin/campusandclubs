/**
 * Auth mutations (login, signup, logout, forgot/reset, verify-email, social).
 *
 * Each mutation gets its own stub so IDE autocomplete shows the full
 * surface. All cache invalidation goes through authKeys.
 */
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { authKeys } from "../auth.keys";
// import { authHttp } from "../auth.http";

export function useAuthMutations() {
  // const queryClient = useQueryClient();

  return {
    logout: { mutate: () => { /* TODO authHttp.logout(); invalidate session */ } },
    login: { mutate: (_p: unknown) => { /* TODO */ } },
    signUp: { mutate: (_p: unknown) => { /* TODO */ } },
    forgotPassword: { mutate: (_p: unknown) => { /* TODO */ } },
    resetPassword: { mutate: (_p: unknown) => { /* TODO */ } },
    verifyEmail: { mutate: (_p: unknown) => { /* TODO */ } },
    verifyEmailOtp: { mutate: (_p: unknown) => { /* TODO */ } },
    socialLogin: { mutate: (_p: unknown) => { /* TODO */ } },
  };
}
