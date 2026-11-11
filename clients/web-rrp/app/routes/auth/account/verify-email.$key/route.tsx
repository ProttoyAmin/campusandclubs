import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { useParams } from "react-router";
import { AuthNav } from "@/features/auth/components/auth-nav";

export const meta: MetaFunction = () => [
  { title: "Verify email • Campus & Clubs" },
];

export async function loader({ params }: LoaderFunctionArgs) {
  return { key: params.key ?? null };
}

export default function VerifyEmailByKeyPage() {
  const { key } = useParams();
  return (
    <section>
      <h2>Verify email (key)</h2>
      <p className="muted">Key: <code>{key}</code></p>
      <p className="muted">Paste <code>VerifyEmail</code> page here.</p>
      <AuthNav />
    </section>
  );
}
