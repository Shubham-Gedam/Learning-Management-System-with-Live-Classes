import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  );
}