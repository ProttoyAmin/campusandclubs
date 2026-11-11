import type { MetaFunction } from "react-router";
import { AuthNav } from "@/features/auth/components/auth-nav";

export const meta: MetaFunction = () => [
  { title: "Sign in • Campus & Clubs" },
  { name: "description", content: "Sign in to your Campus & Clubs account." },
];

export default function SignInPage() {
  return (
    <section>
      <h2>Sign in</h2>
      <p className="muted">Paste <code>SignIn</code> page/form content here.</p>
      <AuthNav />
    </section>
  );
}
