
import SignInPage from "~/features/auth/pages/public/sign-in";
import type { Route } from "./+types/sign-in";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sign In" },
    { name: "description", content: "Sign in to your account" },
  ];
}

export default function SignIn() {
  return <SignInPage />;
}
