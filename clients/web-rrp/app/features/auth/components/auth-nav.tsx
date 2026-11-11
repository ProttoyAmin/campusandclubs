/**
 * Simple nav links for auth pages so you can click around before real
 * forms are pasted in. Delete or reuse as needed.
 */
import { Link } from "react-router";

const LINKS = [
  { to: "/auth/sign-in", label: "Sign in" },
  { to: "/auth/sign-up", label: "Sign up" },
  { to: "/auth/callback", label: "Social callback" },
  { to: "/auth/forgot-password", label: "Forgot password" },
  { to: "/auth/account/reset-password/demo-key", label: "Reset password (demo key)" },
  { to: "/auth/account/verify-email/demo-key", label: "Verify email (key)" },
  { to: "/auth/account/email/verify", label: "Verify email (OTP)" },
  { to: "/activate/demo-uuid/demo-token", label: "Activate" },
  { to: "/", label: "← Back to app" },
];

export function AuthNav() {
  return (
    <nav className="nav-links">
      {LINKS.map((l) => (
        <Link key={l.to} to={l.to}>{l.label}</Link>
      ))}
    </nav>
  );
}
