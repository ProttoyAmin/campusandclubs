/**
 * Auth loaders.
 *
 * Loader functions run on the server before the route renders. Use them
 * to pre-fetch session state / protected-route redirects once SSR is
 * fully wired. For now, they are empty pass-throughs.
 */
import type { LoaderFunctionArgs } from "react-router";

export async function publicAuthLoader(_args: LoaderFunctionArgs) {
  // TODO: if already authenticated, redirect to /.
  return {};
}

export async function protectedLoader(_args: LoaderFunctionArgs) {
  // TODO: if anonymous, redirect to /auth/sign-in.
  return {};
}

export async function activationLoader(_args: LoaderFunctionArgs) {
  // TODO: optionally pre-validate token.
  return {};
}
