import type { MetaFunction } from "react-router";
import { AuthNav } from "@/features/auth/components/auth-nav";

export const meta: MetaFunction = () => [
  { title: "Signing you in… • Campus & Clubs" },
];

export default function SocialCallbackPage() {
  return (
    <section>
      <h2>Social callback</h2>
      <p className="muted">Completing sign in… Paste <code>SocialAuthCallback</code> logic here.</p>
      <AuthNav />
    </section>
  );
}
