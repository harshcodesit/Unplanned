import type { FC } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout: FC = () => {
  return (
    <div className="app-shell" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main style={{ paddingTop: "72px", flex: 1, display: "flex", flexDirection: "column" }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
