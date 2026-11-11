/**
 * Auth layout — wraps every /auth/* page.
 *
 * Paste your existing <AuthLayout /> content here. The skeleton renders
 * a simple centered card shell so routes are reachable immediately.
 */
import { Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <header style={{ marginBottom: "1rem" }}>
          <h1 style={{ fontSize: "1.125rem", fontWeight: 600 }}>campusandclubs</h1>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
