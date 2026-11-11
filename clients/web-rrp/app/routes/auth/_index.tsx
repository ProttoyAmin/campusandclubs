/**
 * /auth  → server-redirects to /auth/sign-in.
 *
 * Using redirect() from the loader avoids the <Navigate> SSR warning
 * and returns a proper 302 response.
 */
import { redirect, type LoaderFunctionArgs, type MetaFunction } from "react-router";

export const meta: MetaFunction = () => [{ title: "Auth • Campus & Clubs" }];

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  throw redirect(`${url.pathname}/sign-in`);
}

// Should never render — loader always redirects.
export default function AuthIndex() {
  return null;
}
