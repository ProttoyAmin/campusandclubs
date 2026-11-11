/**
 * Authenticated app shell layout (pathless — wraps everything except
 * auth and activation).
 *
 * Paste your existing <MainLayout /> (Sidebar + Outlet + Socket +
 * Guard) here. The skeleton renders a minimal two-column shell with
 * placeholder nav so you can click around.
 */
import { Link, Outlet } from "react-router";

export default function AppLayout() {
  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div style={{ fontWeight: 600, marginBottom: "1rem" }}>campusandclubs</div>
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <Link to="/" style={{ color: "#cfd2e3", textDecoration: "none" }}>Home</Link>
          <Link to="/auth/sign-in" style={{ color: "#cfd2e3", textDecoration: "none" }}>Sign in</Link>
          <Link to="/auth/sign-up" style={{ color: "#cfd2e3", textDecoration: "none" }}>Sign up</Link>
        </nav>
      </aside>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
