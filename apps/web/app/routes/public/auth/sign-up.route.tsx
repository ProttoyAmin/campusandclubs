
import SignUpPage from "~/features/auth/pages/public/sign-up";
import type { Route } from "./+types/sign-up.route";
import { authLoader } from "~/features/auth/loaders/auth.loaders";

export async function loader(args: Route.LoaderArgs) {
  return authLoader(args);
}


export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sign Up" },
    { name: "description", content: "Sign up for an account" },
  ];
}

export default function SignUp() {
  return <SignUpPage />;
}
