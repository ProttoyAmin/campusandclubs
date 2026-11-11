import type { MetaFunction } from "react-router";
import { AuthNav } from "@/features/auth/components/auth-nav";

export const meta: MetaFunction = () => [
  { title: "Verify email (code) • Campus & Clubs" },
];

export default function VerifyEmailOtpPage() {
  return (
    <section>
      <h2>Verify email (OTP)</h2>
      <p className="muted">Paste <code>VerifyEmailOTP</code> page here.</p>
      <AuthNav />
    </section>
  );
}
