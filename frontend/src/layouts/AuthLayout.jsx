import { Outlet, Link } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <Link to="/" className="auth-brand">
        LearnSphere
      </Link>

      <main className="auth-content">
        <Outlet />
      </main>

      <p className="auth-footer">
        Learn new skills. Build your future.
      </p>
    </div>
  );
}