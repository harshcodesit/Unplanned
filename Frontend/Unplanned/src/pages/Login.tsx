import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  User as UserIcon,
  X,
} from "lucide-react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import type { User } from "../types/user";
import "./Login.css";

interface LoginResponse {
  message: string;
  token?: string;
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    avatarUrl?: string;
  };
  success: boolean;
}

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, login } = useAuth();
  const toast = useToast();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const locationState = location.state as { from?: { pathname?: string } | string } | null;
  const targetReturnUrl =
    typeof locationState?.from === "string"
      ? locationState.from
      : locationState?.from?.pathname || "/";

  if (!loading && user) {
    return <Navigate to="/profile" replace />;
  }

  const handleIdentifierChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIdentifier(e.target.value);
    if (errorMessage) setErrorMessage(null);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errorMessage) setErrorMessage(null);
  };

  const handleForgotPassword = () => {
    toast.info(
      "Password recovery is arriving soon. For assistance, reach out to support.",
      "Password Recovery"
    );
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedIdentifier = identifier.trim();

    if (!trimmedIdentifier) {
      setErrorMessage("Please enter your email or username.");
      toast.warning("Please enter your email or username.", "Notice");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      toast.warning("Please enter your password.", "Notice");
      return;
    }

    setIsLoading(true);

    try {
      const isEmail = trimmedIdentifier.includes("@");
      const payload = {
        email: isEmail ? trimmedIdentifier.toLowerCase() : undefined,
        username: !isEmail ? trimmedIdentifier.toLowerCase() : undefined,
        password,
      };

      const response = await API.post<LoginResponse>("/user/login", payload);

      if (response.data.success) {
        toast.success(response.data.message || "Logged in successfully!", "Welcome Back");

        const authenticatedUser: User = {
          _id: response.data.user.id,
          name: response.data.user.name,
          username: response.data.user.username,
          email: response.data.user.email,
          avatarUrl: response.data.user.avatarUrl,
        };
        login(authenticatedUser, response.data.token);
        navigate(targetReturnUrl, { replace: true });
      }
    } catch (err: any) {
      setIsLoading(false);
      const backendErrors = err.response?.data?.errors;
      const msg =
        Array.isArray(backendErrors) && backendErrors.length > 0
          ? backendErrors.map((i: any) => i.msg).join(" • ")
          : err.response?.data?.message || "Invalid credentials. Please try again.";

      setErrorMessage(msg);
      toast.error(msg, "Login Failed");
    }
  };

  const isEmailFormat = identifier.includes("@");

  return (
    <div className="login-page-container">
      <div className="login-card">
        <div className="login-card-notch-left" />
        <div className="login-card-notch-right" />

        <div className="login-notched-header">
          <div className="login-kicker-group">
            <KeyRound size={15} className="login-kicker-icon" />
            <span className="login-kicker-text">Wanderer Clearance</span>
          </div>
          <span className="login-step-badge">Check-In</span>
        </div>

        <div className="login-body">
          <div className="login-title-block">
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">
              Check in to discover spontaneous microadventures and manage your live trail.
            </p>
          </div>

          {errorMessage && (
            <div className="login-alert error">
              <div className="login-alert-icon">
                <AlertCircle size={20} />
              </div>
              <div className="login-alert-content">
                <div className="login-alert-title">Authentication Failed</div>
                <p>{errorMessage}</p>
              </div>
              <button
                type="button"
                className="login-alert-close"
                onClick={() => setErrorMessage(null)}
              >
                <X size={16} />
              </button>
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="login-field">
              <label htmlFor="login-identifier" className="login-label">
                Email or Username
              </label>
              <div className="login-input-wrapper">
                {isEmailFormat ? (
                  <Mail size={18} className="login-input-icon" />
                ) : (
                  <UserIcon size={18} className="login-input-icon" />
                )}
                <input
                  id="login-identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  className="login-input"
                  placeholder="wanderer@domain.com or username"
                  value={identifier}
                  onChange={handleIdentifierChange}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <div className="login-label-row">
                <label htmlFor="login-password" className="login-label">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="login-forgot-link"
                >
                  Forgot password?
                </button>
              </div>
              <div className="login-input-wrapper">
                <Lock size={18} className="login-input-icon" />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="login-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={handlePasswordChange}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="btn-spinner" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In To Unplanned</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="login-footer-switch">
            <span>Don't have a Wanderer passport yet?</span>
            <Link to="/register" state={location.state} className="login-switch-link">
              Begin Your Journey
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;