import type { MetaFunction } from "react-router";
import { AuthNav } from "@/features/auth/components/auth-nav";

export const meta: MetaFunction = () => [
  { title: "Forgot password • Campus & Clubs" },
  { name: "description", content: "Recover your Campus & Clubs account." },
];

export default function ForgotPasswordPage() {
  return (
    <section>
      <h2>Forgot password</h2>
      <p className="muted">Paste <code>ForgotPasswordPage</code> form here.</p>
      <AuthNav />
    </section>
  );
}
