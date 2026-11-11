import type { MetaFunction } from "react-router";
import { AuthNav } from "@/features/auth/components/auth-nav";

export const meta: MetaFunction = () => [
  { title: "Create account • Campus & Clubs" },
  { name: "description", content: "Join Campus & Clubs — connect with your campus." },
];

export default function SignUpPage() {
  return (
    <section>
      <h2>Create account</h2>
      <p className="muted">Paste <code>SignUp</code> page/form content here.</p>
      <AuthNav />
    </section>
  );
}
