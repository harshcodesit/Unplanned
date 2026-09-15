import { useState, type ChangeEvent, type FC, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
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

interface BackendErrorItem {
  msg: string;
}

interface LoginResponse {
  message: string;
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    avatarUrl?: string;
  };
  success: boolean;
}

interface AlertState {
  type: "error" | "success";
  title: string;
  messages: string[];
}

interface LocationStateWithFrom {
  from?: string | { pathname?: string; search?: string; hash?: string };
}

const Login: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, login } = useAuth();
  const toast = useToast();

  // Form input values
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState | null>(null);

  // Compute return URL for deep linking after auth
  const locationState = location.state as LocationStateWithFrom | null;
  let targetReturnUrl = "/";
  if (locationState?.from) {
    if (typeof locationState.from === "string") {
      targetReturnUrl = locationState.from;
    } else if (locationState.from.pathname) {
      targetReturnUrl = `${locationState.from.pathname}${locationState.from.search || ""}${locationState.from.hash || ""}`;
    }
  }

  // If already logged in, redirect straight to profile page
  if (!loading && user) {
    return <Navigate to="/profile" replace />;
  }

  const handleIdentifierChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIdentifier(e.target.value);
    if (alert) setAlert(null);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (alert) setAlert(null);
  };

  const handleForgotPassword = () => {
    toast.info(
      "Self-service password recovery is arriving soon. For immediate assistance, reach out to trail guide support.",
      "Password Recovery"
    );
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAlert(null);

    const trimmedIdentifier = identifier.trim();

    // Client-side validations
    if (!trimmedIdentifier) {
      const msg = "Please enter your email address or username.";
      setAlert({
        type: "error",
        title: "Credentials Required",
        messages: [msg],
      });
      toast.warning(msg, "Validation Notice");
      return;
    }

    if (!password) {
      const msg = "Please enter your password.";
      setAlert({
        type: "error",
        title: "Password Required",
        messages: [msg],
      });
      toast.warning(msg, "Validation Notice");
      return;
    }

    setIsLoading(true);

    try {
      // Intelligently route identifier to email or username field based on '@' presence
      const isEmail = trimmedIdentifier.includes("@");
      const payload = {
        email: isEmail ? trimmedIdentifier.toLowerCase() : undefined,
        username: !isEmail ? trimmedIdentifier.toLowerCase() : undefined,
        password,
      };

      const response = await API.post<LoginResponse>("/user/login", payload);

      if (response.data.success) {
        // Trigger global persistent toast that survives route redirect
        const successMessage = response.data.message || "Logged in successfully! Welcome back.";
        toast.success(successMessage, "Access Granted");

        // Sync authenticated user in global context
        const authenticatedUser: User = {
          _id: response.data.user.id,
          name: response.data.user.name,
          username: response.data.user.username,
          email: response.data.user.email,
          avatarUrl: response.data.user.avatarUrl,
        };
        login(authenticatedUser);

        // Immediate redirection: toast stays visible seamlessly on destination page
        navigate(targetReturnUrl, { replace: true });
      }
    } catch (err: unknown) {
      setIsLoading(false);

      interface AxiosErrorResponse {
        response?: {
          status?: number;
          data?: {
            errors?: BackendErrorItem[];
            message?: string;
          };
        };
      }

      const axiosError = err as AxiosErrorResponse;
      const backendErrors = axiosError.response?.data?.errors;
      const singleMessage = axiosError.response?.data?.message;

      if (Array.isArray(backendErrors) && backendErrors.length > 0) {
        const msgs = backendErrors.map((item) => item.msg);
        setAlert({
          type: "error",
          title: "Authentication Failed",
          messages: msgs,
        });
        toast.error(msgs.join(" • "), "Authentication Failed");
      } else if (singleMessage) {
        setAlert({
          type: "error",
          title: "Authentication Failed",
          messages: [singleMessage],
        });
        toast.error(singleMessage, "Authentication Failed");
      } else {
        const fallbackMsg =
          "Unable to connect to the authentication server. Please check your connection and try again.";
        setAlert({
          type: "error",
          title: "Connection Error",
          messages: [fallbackMsg],
        });
        toast.error(fallbackMsg, "Connection Error");
      }
    }
  };

  const isEmailFormat = identifier.includes("@");

  return (
    <div className="login-page-container">
      <div className="login-card" role="region" aria-labelledby="login-heading">
        {/* Ticket-Style Semicircular Waist Cutout Notches (Seamless Arch Geometry) */}
        <div className="login-card-notch-left" aria-hidden="true" />
        <div className="login-card-notch-right" aria-hidden="true" />

        {/* Notched Top Header with Inverted Negative-Radius Scoop */}
        <div className="login-notched-header">
          <div className="login-kicker-group">
            <KeyRound size={15} className="login-kicker-icon" />
            <span className="login-kicker-text">Wanderer Clearance</span>
          </div>
          <span className="login-step-badge">Check-In</span>
        </div>

        <div className="login-body">
          {/* Header Title Block */}
          <div className="login-title-block">
            <h1 id="login-heading" className="login-title">
              Welcome Back
            </h1>
            <p className="login-subtitle">
              Check in to discover spontaneous microadventures and manage your live trail.
            </p>
          </div>

          {/* Integrated Alert Banner */}
          {alert && (
            <div
              className={`login-alert ${alert.type}`}
              role="alert"
              aria-live="assertive"
            >
              <div className="login-alert-icon">
                {alert.type === "error" ? (
                  <AlertCircle size={20} />
                ) : (
                  <CheckCircle2 size={20} />
                )}
              </div>
              <div className="login-alert-content">
                <div className="login-alert-title">{alert.title}</div>
                {alert.messages.length === 1 ? (
                  <p>{alert.messages[0]}</p>
                ) : (
                  <ul className="login-alert-list">
                    {alert.messages.map((msg, index) => (
                      <li key={index}>{msg}</li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                type="button"
                className="login-alert-close"
                onClick={() => setAlert(null)}
                aria-label="Dismiss alert"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Form */}
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {/* Email or Username */}
            <div className="login-field">
              <label htmlFor="login-identifier" className="login-label">
                Email or Username
              </label>
              <div className="login-input-wrapper">
                {isEmailFormat ? (
                  <Mail size={18} className="login-input-icon" aria-hidden="true" />
                ) : (
                  <UserIcon size={18} className="login-input-icon" aria-hidden="true" />
                )}
                <input
                  id="login-identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  className="login-input"
                  placeholder="wanderer@domain.com or wanderer_id"
                  value={identifier}
                  onChange={handleIdentifierChange}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Password */}
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
                <Lock size={18} className="login-input-icon" aria-hidden="true" />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="login-input"
                  placeholder="Enter your secret password"
                  value={password}
                  onChange={handlePasswordChange}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={0}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit CTA Button */}
            <button
              type="submit"
              className="login-submit-btn"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="btn-spinner" aria-hidden="true" />
                  <span>Verifying Clearance...</span>
                </>
              ) : (
                <>
                  <span>Sign In To Unplanned</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer Switch to Sign Up */}
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