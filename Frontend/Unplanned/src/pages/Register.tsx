import { useState, type ChangeEvent, type FormEvent } from "react";
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
  Sparkles,
  User as UserIcon,
  X,
} from "lucide-react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import type { User } from "../types/user";
import "./Register.css";

interface RegisterResponse {
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

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, login } = useAuth();
  const toast = useToast();

  const locationState = location.state as { from?: { pathname?: string } | string } | null;
  const targetReturnUrl =
    typeof locationState?.from === "string"
      ? locationState.from
      : locationState?.from?.pathname || "/";

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isUsernameValid =
    formData.username.length === 0 || USERNAME_REGEX.test(formData.username);
  const isPasswordLengthValid =
    formData.password.length === 0 || formData.password.length >= 6;
  const doPasswordsMatch =
    formData.confirmPassword.length === 0 ||
    formData.password === formData.confirmPassword;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const clientErrors: string[] = [];
    if (!formData.name.trim()) clientErrors.push("Please enter your full name.");
    if (!formData.username.trim()) {
      clientErrors.push("Please choose a username.");
    } else if (!USERNAME_REGEX.test(formData.username)) {
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
      setErrorMessage(clientErrors[0]);
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
        toast.success(response.data.message || "User registered successfully!", "Registration Successful");

        const registeredUser: User = {
          _id: response.data.user.id,
          name: response.data.user.name,
          username: response.data.user.username,
          email: response.data.user.email,
          avatarUrl: response.data.user.avatarUrl,
        };
        login(registeredUser, response.data.token);
        navigate(targetReturnUrl, { replace: true });
      }
    } catch (err: any) {
      setIsLoading(false);
      const backendErrors = err.response?.data?.errors;
      const msg =
        Array.isArray(backendErrors) && backendErrors.length > 0
          ? backendErrors.map((item: any) => item.msg).join(" • ")
          : err.response?.data?.message || "Registration failed. Please try again.";

      setErrorMessage(msg);
      toast.error(msg, "Registration Failed");
    }
  };

  return (
    <div className="register-page-container">
      <div className="register-card">
        <div className="register-card-notch-left" />
        <div className="register-card-notch-right" />

        <div className="register-notched-header">
          <div className="register-kicker-group">
            <Sparkles size={15} className="register-kicker-icon" />
            <span className="register-kicker-text">Wanderer Passport</span>
          </div>
          <span className="register-step-badge">New Trail</span>
        </div>

        <div className="register-body">
          <div className="register-title-block">
            <h1 className="register-title">Begin Your Journey</h1>
            <p className="register-subtitle">
              Join spontaneous explorers discovering microadventures, protected rendezvous, and
              verified community trails.
            </p>
          </div>

          {errorMessage && (
            <div className="register-alert error">
              <AlertCircle size={20} className="register-alert-icon" />
              <div className="register-alert-content">
                <div className="register-alert-title">Registration Failed</div>
                <div>{errorMessage}</div>
              </div>
              <button
                type="button"
                className="register-alert-close"
                onClick={() => setErrorMessage(null)}
              >
                <X size={16} />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="register-form" noValidate>
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
                <span>Wanderer Tag / Username</span>
              </label>
              <div className="register-input-wrapper">
                <AtSign size={18} className="register-input-icon" />
                <input
                  id="reg-username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="e.g. elena_wanderer"
                  autoComplete="username"
                  required
                  disabled={isLoading || isSuccess}
                  className="register-input"
                />
              </div>
              {!isUsernameValid && (
                <span className="register-hint error">
                  Username must be 3-20 letters, numbers, or underscores.
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
                  placeholder="you@domain.com"
                  autoComplete="email"
                  required
                  disabled={isLoading || isSuccess}
                  className="register-input"
                />
              </div>
            </div>

            <div className="register-field">
              <label htmlFor="reg-password" className="register-label">
                <span>Secret Passkey</span>
              </label>
              <div className="register-input-wrapper">
                <Lock size={18} className="register-input-icon" />
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  required
                  disabled={isLoading || isSuccess}
                  className="register-input"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {!isPasswordLengthValid && (
                <span className="register-hint error">Password must be at least 6 characters.</span>
              )}
            </div>

            <div className="register-field">
              <label htmlFor="reg-confirm-password" className="register-label">
                <span>Confirm Passkey</span>
              </label>
              <div className="register-input-wrapper">
                <Lock size={18} className="register-input-icon" />
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
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
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
                  <span className="btn-spinner" />
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