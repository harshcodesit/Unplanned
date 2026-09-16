import { useState, type ChangeEvent, type FC, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  AtSign,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
  X,
} from "lucide-react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import type { User } from "../types/user";
import "./Register.css";

interface BackendErrorItem {
  msg: string;
}

interface RegisterResponse {
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

const Register: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, login } = useAuth();
  const toast = useToast();

  const locationState = location.state as LocationStateWithFrom | null;
  let targetReturnUrl = "/";
  if (locationState?.from) {
    if (typeof locationState.from === "string") {
      targetReturnUrl = locationState.from;
    } else if (locationState.from.pathname) {
      targetReturnUrl = `${locationState.from.pathname}${locationState.from.search || ""}${locationState.from.hash || ""}`;
    }
  }

  if (!loading && user) {
    return <Navigate to="/profile" replace />;
  }

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [alert, setAlert] = useState<AlertState | null>(null);

  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  const isUsernameValid =
    formData.username.length === 0 || usernameRegex.test(formData.username);
  const isPasswordLengthValid =
    formData.password.length === 0 || formData.password.length >= 6;
  const doPasswordsMatch =
    formData.confirmPassword.length === 0 ||
    formData.password === formData.confirmPassword;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (alert) setAlert(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAlert(null);

    const clientErrors: string[] = [];

    if (!formData.name.trim()) clientErrors.push("Please enter your full name.");
    if (!formData.username.trim()) {
      clientErrors.push("Please choose a username.");
    } else if (!usernameRegex.test(formData.username)) {
      clientErrors.push(
        "Username can only contain letters, numbers, and underscores, and be 3-20 characters long."
      );
    }

    if (!formData.email.trim()) {
      clientErrors.push("Please enter your email address.");
    }

    if (!formData.password) {
      clientErrors.push("Please enter a password.");
    } else if (formData.password.length < 6) {
      clientErrors.push("Password must be at least 6 characters.");
    }

    if (formData.password !== formData.confirmPassword) {
      clientErrors.push("Passwords do not match.");
    }

    if (clientErrors.length > 0) {
      setAlert({
        type: "error",
        title: "Please check your information",
        messages: clientErrors,
      });
      toast.warning(clientErrors[0], "Validation Notice");
      return;
    }

    setIsLoading(true);

    try {
      const response = await API.post<RegisterResponse>("/user/register", {
        name: formData.name.trim(),
        username: formData.username.trim().toLowerCase(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (response.data.success) {
        setIsSuccess(true);

        const successMessage =
          response.data.message || "User registered successfully! Welcome to Unplanned.";
        toast.success(successMessage, "Registration Successful");

        const registeredUser: User = {
          _id: response.data.user.id,
          name: response.data.user.name,
          username: response.data.user.username,
          email: response.data.user.email,
          avatarUrl: response.data.user.avatarUrl,
        };
        login(registeredUser);

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
          title: "Registration Failed",
          messages: msgs,
        });
        toast.error(msgs.join(" • "), "Registration Failed");
      } else if (singleMessage) {
        setAlert({
          type: "error",
          title: "Registration Failed",
          messages: [singleMessage],
        });
        toast.error(singleMessage, "Registration Failed");
      } else {
        const fallbackMsg =
          "Unable to connect to the server. Please check your connection and try again.";
        setAlert({
          type: "error",
          title: "Connection Error",
          messages: [fallbackMsg],
        });
        toast.error(fallbackMsg, "Connection Error");
      }
    }
  };

  return (
    <div className="register-page-container">
      <div className="register-card" role="region" aria-labelledby="register-heading">

        <div className="register-card-notch-left" aria-hidden="true" />
        <div className="register-card-notch-right" aria-hidden="true" />

        <div className="register-notched-header">
          <div className="register-kicker-group">
            <Sparkles size={15} className="register-kicker-icon" />
            <span className="register-kicker-text">Wanderer Passport</span>
          </div>
          <span className="register-step-badge">New Trail</span>
        </div>

        <div className="register-body">

          <div className="register-title-block">
            <h1 id="register-heading" className="register-title">
              Begin Your Journey
            </h1>
            <p className="register-subtitle">
              Join spontaneous explorers discovering microadventures, protected rendezvous, and
              verified community trails.
            </p>
          </div>

          {alert && (
            <div
              className={`register-alert ${alert.type}`}
              role={alert.type === "error" ? "alert" : "status"}
              aria-live="polite"
            >
              {alert.type === "error" ? (
                <AlertCircle size={20} className="register-alert-icon" />
              ) : (
                <CheckCircle2 size={20} className="register-alert-icon" />
              )}

              <div className="register-alert-content">
                <div className="register-alert-title">{alert.title}</div>
                {alert.messages.length === 1 ? (
                  <div>{alert.messages[0]}</div>
                ) : (
                  <ul className="register-alert-list">
                    {alert.messages.map((msg, idx) => (
                      <li key={idx}>{msg}</li>
                    ))}
                  </ul>
                )}
              </div>

              <button
                type="button"
                className="register-alert-close"
                onClick={() => setAlert(null)}
                aria-label="Dismiss alert"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="register-form"
            noValidate
            aria-busy={isLoading}
          >

            <div className="register-field">
              <label htmlFor="reg-name" className="register-label">
                <span>Full Name</span>
              </label>
              <div className="register-input-wrapper">
                <UserIcon size={18} className="register-input-icon" />
                <input
                  id="reg-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Elena Rostova"
                  autoComplete="name"
                  required
                  disabled={isLoading || isSuccess}
                  className="register-input"
                />
              </div>
            </div>

            <div className="register-field">
              <label htmlFor="reg-username" className="register-label">
                <span>Username</span>
              </label>
              <div className="register-input-wrapper">
                <AtSign size={18} className="register-input-icon" />
                <input
                  id="reg-username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="e.g. elena_r"
                  autoComplete="username"
                  required
                  disabled={isLoading || isSuccess}
                  className="register-input"
                  aria-invalid={!isUsernameValid}
                />
              </div>
              {!isUsernameValid ? (
                <span className="register-hint error">
                  3-20 characters: letters, numbers, and underscores only.
                </span>
              ) : (
                <span className="register-hint">
                  This will be your public wanderer handle.
                </span>
              )}
            </div>

            <div className="register-field">
              <label htmlFor="reg-email" className="register-label">
                <span>Email Address</span>
              </label>
              <div className="register-input-wrapper">
                <Mail size={18} className="register-input-icon" />
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="elena@example.com"
                  autoComplete="email"
                  required
                  disabled={isLoading || isSuccess}
                  className="register-input"
                />
              </div>
            </div>

            <div className="register-field">
              <label htmlFor="reg-password" className="register-label">
                <span>Password</span>
                <span className="register-label-optional">Min. 6 characters</span>
              </label>
              <div className="register-input-wrapper">
                <Lock size={18} className="register-input-icon" />
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a secure password"
                  autoComplete="new-password"
                  required
                  disabled={isLoading || isSuccess}
                  className="register-input"
                  aria-invalid={!isPasswordLengthValid}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {!isPasswordLengthValid && (
                <span className="register-hint error">
                  Password must be at least 6 characters.
                </span>
              )}
            </div>

            <div className="register-field">
              <label htmlFor="reg-confirm-password" className="register-label">
                <span>Confirm Password</span>
              </label>
              <div className="register-input-wrapper">
                <ShieldCheck size={18} className="register-input-icon" />
                <input
                  id="reg-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  required
                  disabled={isLoading || isSuccess}
                  className="register-input"
                  aria-invalid={!doPasswordsMatch}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {!doPasswordsMatch ? (
                <span className="register-hint error">Passwords do not match.</span>
              ) : formData.confirmPassword.length > 0 ? (
                <span className="register-hint valid">
                  <Check size={13} /> Passwords match
                </span>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className="register-submit-btn"
              id="register-submit-btn"
            >
              {isLoading ? (
                <>
                  <span className="btn-spinner" aria-hidden="true" />
                  <span>Creating Account...</span>
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 size={18} />
                  <span>Account Created!</span>
                </>
              ) : (
                <>
                  <span>Create Wanderer Account</span>
                  <ArrowRight size={18} strokeWidth={2.4} />
                </>
              )}
            </button>
          </form>

          <div className="register-footer-switch">
            <span>Already have an explorer account?</span>
            <Link to="/login" state={location.state} className="register-switch-link">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;