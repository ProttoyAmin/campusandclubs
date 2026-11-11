import type { MetaFunction } from "react-router";
import { Link } from "react-router";

export const meta: MetaFunction = () => [
  { title: "Page not found • Campus & Clubs" },
];

export default function NotFoundPage() {
  return (
    <section>
      <h1>Page not found</h1>
      <p className="muted">The page you requested doesn't exist.</p>
      <div className="nav-links">
        <Link to="/">Go home</Link>
      </div>
    </section>
  );
}
