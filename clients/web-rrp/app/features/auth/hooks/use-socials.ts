/**
 * Social login mutation(s).
 *
 * Wires OAuth redirect flows through authHttp.submitSocialLogin().
 */
// import { useMutation } from "@tanstack/react-query";
// import { authHttp } from "../auth.http";

export function useSocials() {
  return {
    socialLogin: { mutate: (_provider: string) => { /* TODO */ } },
  };
}
