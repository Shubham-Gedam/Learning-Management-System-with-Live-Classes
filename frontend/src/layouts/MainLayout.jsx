
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function MainLayout() {
  return (
    <div className="app-layout">
      <Navbar />

      <div className="main-content">
        <Outlet />
      </div>

      <Footer />
    </div>
  );
}
