import type { FC } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VibesFeed from "./pages/VibesFeed";
import VibeCreate from "./pages/VibeCreate";
import Trail from "./pages/Trail";
import Profile from "./pages/Profile";

const App: FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route element={<Layout />}>
              {/* Primary Hub Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/vibes" element={<VibesFeed />} />
              <Route path="/trail" element={<Trail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/vibes/create" element={<VibeCreate />} />
                <Route path="/profile" element={<Profile />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
