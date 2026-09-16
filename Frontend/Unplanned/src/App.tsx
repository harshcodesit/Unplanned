import { lazy, Suspense, type FC } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import RouteLoadingFallback from "./components/RouteLoadingFallback";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const VibesFeed = lazy(() => import("./pages/VibesFeed"));
const VibeDetails = lazy(() => import("./pages/VibeDetails"));
const VibeCreate = lazy(() => import("./pages/VibeCreate"));
const Trail = lazy(() => import("./pages/Trail"));
const Profile = lazy(() => import("./pages/Profile"));

const App: FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <ErrorBoundary>
            <Suspense fallback={<RouteLoadingFallback />}>
              <Routes>
                <Route element={<Layout />}>

                  <Route path="/" element={<Home />} />
                  <Route path="/vibes" element={<VibesFeed />} />
                  <Route path="/vibes/:id" element={<VibeDetails />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  <Route element={<ProtectedRoute />}>
                    <Route path="/trail" element={<Trail />} />
                    <Route path="/vibes/create" element={<VibeCreate />} />
                    <Route path="/profile" element={<Profile />} />
                  </Route>

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;

