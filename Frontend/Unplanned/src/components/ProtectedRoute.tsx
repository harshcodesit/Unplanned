import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ padding: "4rem 2rem", textAlign: "center", color: "var(--color-muted)" }}>
        Loading authentication status...
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
};

export default ProtectedRoute;