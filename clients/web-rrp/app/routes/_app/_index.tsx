import type { MetaFunction } from "react-router";
import { Link } from "react-router";

export const meta: MetaFunction = () => [
  { title: "Campus & Clubs" },
  { name: "description", content: "Campus & Clubs — connect with your campus." },
];

export default function HomePage() {
  return (
    <section>
      <h1>Home</h1>
      <p className="muted">
        React Router v7 scaffold. Paste the real feed/home page here once
        you're ready to port non-auth features.
      </p>
      <div className="nav-links">
        <Link to="/auth/sign-in">Sign in</Link>
        <Link to="/auth/sign-up">Create account</Link>
        <Link to="/auth/forgot-password">Forgot password</Link>
      </div>
    </section>
  );
}
