import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link, useParams } from "react-router";

export const meta: MetaFunction = () => [
  { title: "Activate account • Campus & Clubs" },
];

export async function loader({ params }: LoaderFunctionArgs) {
  return {
    uuid: params.uuid ?? null,
    token: params.token ?? null,
  };
}

export default function ActivationPage() {
  const { uuid, token } = useParams();
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h2>Activate account</h2>
        <p className="muted">
          uuid: <code>{uuid}</code><br />
          token: <code>{token}</code>
        </p>
        <p className="muted">Paste <code>Activation</code> page here.</p>
        <div className="nav-links">
          <Link to="/auth/sign-in">Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}
