import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { useParams } from "react-router";
import { AuthNav } from "@/features/auth/components/auth-nav";

export const meta: MetaFunction = () => [
  { title: "Reset password • Campus & Clubs" },
];

export async function loader({ params }: LoaderFunctionArgs) {
  // params.key carries the one-time key from the email link.
  return { key: params.key ?? null };
}

export default function ResetPasswordPage() {
  const { key } = useParams();
  return (
    <section>
      <h2>Reset password</h2>
      <p className="muted">Key: <code>{key}</code></p>
      <p className="muted">Paste <code>ResetPasswordPage</code> form here.</p>
      <AuthNav />
    </section>
  );
}
