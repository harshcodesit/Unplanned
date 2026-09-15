import { useEffect, useRef, useState, type FC, type FormEvent, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  AtSign,
  Calendar,
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  Flame,
  Footprints,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  Trash2,
  UploadCloud,
  User as UserIcon,
  X,
} from "lucide-react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { DEFAULT_AVATAR_URL, getAvatarUrl, type User } from "../types/user";
import "./Profile.css";

interface ProfileApiResponse {
  success: boolean;
  user: User;
}

type ProfileTab = "identity" | "security" | "danger";

const Profile: FC = () => {
  const { user: authUser, checkAuth, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Primary State
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ProfileTab>("identity");

  // Profile Update Form State
  const [name, setName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [newPassword2, setNewPassword2] = useState<string>("");
  const [showCurrentPw, setShowCurrentPw] = useState<boolean>(false);
  const [showNewPw, setShowNewPw] = useState<boolean>(false);
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);

  // Account Deletion State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState<string>("");
  const [isDeletingAccount, setIsDeletingAccount] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch full profile with populated vibes
  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await API.get<ProfileApiResponse>("/user/profile");
      if (res.data.success && res.data.user) {
        const u = res.data.user;
        setProfile(u);
        setName(u.name || "");
        setUsername(u.username || "");
        setEmail(u.email || "");
      }
    } catch (err) {
      console.error("Error loading user profile:", err);
      toast.error("Could not load user profile details.", "Radar Error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle Avatar Selection
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.warning("Please choose a valid image file (PNG, JPG, WEBP).", "Invalid File");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.warning("Avatar file size must be less than 5MB.", "File Too Large");
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Profile Form Validation
  const validateProfileForm = () => {
    const errs: { [key: string]: string } = {};
    if (!name.trim()) errs.name = "Full name is required.";
    if (!username.trim()) {
      errs.username = "Username is required.";
    } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      errs.username = "Username must be 3-20 letters, numbers, or underscores.";
    }
    if (!email.trim()) {
      errs.email = "Email address is required.";
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      errs.email = "Please enter a valid email address.";
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Profile Update
  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateProfileForm()) {
      toast.warning("Please resolve the highlighted fields.", "Validation Notice");
      return;
    }

    setIsSavingProfile(true);
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("username", username.trim().toLowerCase());
    formData.append("email", email.trim().toLowerCase());
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    try {
      const res = await API.put("/user/update-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        toast.success("Explorer passport updated successfully!", "Identity Saved");
        setAvatarFile(null);
        await checkAuth();
        await fetchProfile();
      }
    } catch (err: unknown) {
      console.error("Profile update error:", err);
      interface AxiosErr {
        response?: { data?: { errors?: { msg: string }[]; message?: string } };
      }
      const e = err as AxiosErr;
      const msg = e.response?.data?.errors?.[0]?.msg || e.response?.data?.message || "Failed to update profile.";
      toast.error(msg, "Update Error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Submit Password Change
  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !newPassword2) {
      toast.warning("Please fill in all password fields.", "Security Check");
      return;
    }
    if (newPassword.length < 6) {
      toast.warning("New password must be at least 6 characters.", "Password Too Short");
      return;
    }
    if (newPassword !== newPassword2) {
      toast.warning("New passwords do not match.", "Password Mismatch");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await API.put("/user/change-password", {
        currentPassword,
        newPassword,
        newPassword2,
      });

      if (res.data.success) {
        toast.success("Security key updated successfully! Use your new password on next sign in.", "Password Updated");
        setCurrentPassword("");
        setNewPassword("");
        setNewPassword2("");
      }
    } catch (err: unknown) {
      console.error("Password update error:", err);
      interface AxiosErr {
        response?: { data?: { errors?: { msg: string }[] } };
      }
      const e = err as AxiosErr;
      const msg = e.response?.data?.errors?.[0]?.msg || "Failed to update password.";
      toast.error(msg, "Security Error");
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Submit Account Deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== "DELETE") {
      toast.warning("Please type DELETE to verify account termination.", "Confirmation Required");
      return;
    }

    setIsDeletingAccount(true);
    try {
      const res = await API.delete("/user/delete-account");
      if (res.data.success) {
        toast.info("Account permanently deleted. Safe travels, wanderer.", "Account Terminated");
        setIsDeleteModalOpen(false);
        await logout();
        navigate("/register", { replace: true });
      }
    } catch (err: unknown) {
      console.error("Error deleting account:", err);
      toast.error("Could not delete account. Please try again.", "Error");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  // Format date helper
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Wanderer";
    try {
      return new Date(dateStr).toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="profile-container">
        <div className="profile-skeleton-card">
          <div className="profile-skeleton-shimmer" style={{ width: "35%", height: "30px", marginBottom: "1.5rem" }} />
          <div style={{ display: "flex", gap: "2rem", alignItems: "center", marginBottom: "2.5rem" }}>
            <div className="profile-skeleton-shimmer" style={{ width: "110px", height: "110px", borderRadius: "50%" }} />
            <div style={{ flex: 1 }}>
              <div className="profile-skeleton-shimmer" style={{ width: "60%", height: "24px", marginBottom: "0.75rem" }} />
              <div className="profile-skeleton-shimmer" style={{ width: "40%", height: "16px" }} />
            </div>
          </div>
          <div className="profile-skeleton-shimmer" style={{ width: "100%", height: "180px" }} />
        </div>
      </div>
    );
  }

  const currentAvatar = avatarPreview || getAvatarUrl(profile?.avatarUrl || authUser?.avatarUrl);

  return (
    <div className="profile-container">
      {/* 1. Top Navigation & Action Strip */}
      <div className="profile-nav-bar">
        <Link to="/vibes" className="profile-back-link">
          <ArrowLeft size={16} />
          <span>Back to Radar</span>
        </Link>

        <div className="profile-nav-right">
          <button
            type="button"
            onClick={logout}
            className="profile-logout-btn"
            title="Log out of Unplanned"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* 2. Hero Explorer Passport Card (Asymmetric Silhouette) */}
      <section className="profile-passport-card" aria-label="Explorer Passport">
        {/* Seamless Ticket Waist Notches */}
        <div className="profile-notch-left" aria-hidden="true" />
        <div className="profile-notch-right" aria-hidden="true" />

        {/* Crown Header Tab with Negative Corners */}
        <div className="profile-passport-crown">
          <div className="profile-crown-kicker">
            <span className="profile-pulse-dot" aria-hidden="true" />
            <span>Explorer Passport & Mission Command</span>
          </div>
          <span className="profile-crown-status">
            Sector Active: @{profile?.username || "wanderer"}
          </span>
        </div>

        <div className="profile-passport-body">
          <div className="profile-hero-split">
            {/* Holographic Radar Avatar Capsule */}
            <div className="profile-avatar-capsule">
              <div className="profile-avatar-orbit-ring" aria-hidden="true" />
              <div
                className="profile-avatar-inner"
                onClick={() => fileInputRef.current?.click()}
                title="Click to update avatar photo"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
                }}
              >
                {currentAvatar ? (
                  <img
                    src={currentAvatar}
                    alt={profile?.name || "Avatar"}
                    className="profile-avatar-img"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_AVATAR_URL;
                    }}
                  />
                ) : (
                  <div className="profile-avatar-placeholder">
                    {(profile?.name || profile?.username || "U")[0].toUpperCase()}
                  </div>
                )}
                <div className="profile-avatar-overlay">
                  <Camera size={20} />
                  <span>Update</span>
                </div>
              </div>
            </div>

            {/* Identity Bio Strip */}
            <div className="profile-identity-info">
              <span className="profile-rank-chip">Trail Pathfinder</span>
              <h1 className="profile-name">{profile?.name || "Anonymous Wanderer"}</h1>

              <div className="profile-handle-row">
                <span className="profile-username-pill">@{profile?.username}</span>
                <span className="profile-email-meta">
                  <Mail size={14} />
                  <span>{profile?.email}</span>
                </span>
                <span className="profile-joined-meta">
                  <Calendar size={14} />
                  <span>Member since {formatDate(profile?.createdAt)}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Aura Statistics Bar */}
          <div className="profile-aura-stats">
            <div className="profile-stat-box">
              <div className="profile-stat-icon">
                <Flame size={22} style={{ color: "var(--color-terracotta)" }} />
              </div>
              <div>
                <span className="profile-stat-number">{profile?.hostedVibes?.length || 0}</span>
                <span className="profile-stat-label">Sparks Hosted</span>
              </div>
            </div>

            <div className="profile-stat-box">
              <div className="profile-stat-icon">
                <Footprints size={22} style={{ color: "var(--color-amber)" }} />
              </div>
              <div>
                <span className="profile-stat-number">{profile?.joinedVibes?.length || 0}</span>
                <span className="profile-stat-label">Footprints Joined</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Dossier Tab Switcher */}
      <nav className="profile-tabs-container" aria-label="Profile navigation tabs">
        <button
          type="button"
          className={`profile-tab-btn ${activeTab === "identity" ? "active" : ""}`}
          onClick={() => setActiveTab("identity")}
        >
          <UserIcon size={16} />
          <span>Identity Details</span>
        </button>

        <button
          type="button"
          className={`profile-tab-btn ${activeTab === "security" ? "active" : ""}`}
          onClick={() => setActiveTab("security")}
        >
          <KeyRound size={16} />
          <span>Security & Keys</span>
        </button>

        <button
          type="button"
          className={`profile-tab-btn danger ${activeTab === "danger" ? "active" : ""}`}
          onClick={() => setActiveTab("danger")}
        >
          <AlertTriangle size={16} />
          <span>Danger Zone</span>
        </button>
      </nav>

      {/* 4. Tab Panels */}

      {/* TAB 1: Identity Details Form */}
      {activeTab === "identity" && (
        <div className="profile-panel">
          <div className="profile-panel-header">
            <h2 className="profile-panel-title">
              <UserIcon size={22} style={{ color: "var(--color-pine)" }} />
              <span>Update Explorer Identity</span>
            </h2>
            <p className="profile-panel-subtitle">
              Modify your public display name, radar callsign username, and contact email.
            </p>
          </div>

          <form onSubmit={handleUpdateProfile}>
            {/* Avatar Upload Drop Zone */}
            <div className="profile-avatar-upload-zone">
              {currentAvatar ? (
                <img src={currentAvatar} alt="" className="profile-avatar-preview-thumb" />
              ) : (
                <div className="profile-avatar-preview-thumb" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#004741", color: "#E5A93C", fontWeight: 800 }}>
                  {(name || username || "U")[0].toUpperCase()}
                </div>
              )}

              <div className="profile-avatar-upload-text">
                <strong>Profile Avatar Photo</strong>
                <span>
                  {avatarFile
                    ? `Selected: ${avatarFile.name} (${(avatarFile.size / 1024).toFixed(0)} KB)`
                    : "Upload a fresh portrait photo to stand out on the radar."}
                </span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="profile-hidden-file-input"
              />

              <button
                type="button"
                className="profile-choose-file-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud size={16} />
                <span>{avatarFile ? "Change Photo" : "Upload Photo"}</span>
              </button>

              {avatarFile && (
                <button
                  type="button"
                  onClick={() => {
                    setAvatarFile(null);
                    setAvatarPreview(null);
                  }}
                  className="details-back-link"
                  style={{ padding: "6px 12px", fontSize: "0.78rem" }}
                  title="Remove selected photo"
                >
                  <X size={14} />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Input Grid */}
            <div className="profile-form-grid">
              <div className="profile-field-group">
                <label className="profile-field-label">
                  <UserIcon size={14} />
                  <span>Full Name</span>
                </label>
                <div className="profile-field-input-wrapper">
                  <UserIcon size={16} className="profile-input-icon" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Maya Lin"
                    className="profile-field-input"
                    required
                  />
                </div>
                {formErrors.name && <span className="profile-input-error">{formErrors.name}</span>}
              </div>

              <div className="profile-field-group">
                <label className="profile-field-label">
                  <AtSign size={14} />
                  <span>Radar Callsign (@Username)</span>
                </label>
                <div className="profile-field-input-wrapper">
                  <AtSign size={16} className="profile-input-icon" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. mayawanderer"
                    className="profile-field-input"
                    required
                  />
                </div>
                {formErrors.username && <span className="profile-input-error">{formErrors.username}</span>}
              </div>

              <div className="profile-field-group">
                <label className="profile-field-label">
                  <Mail size={14} />
                  <span>Contact Email</span>
                </label>
                <div className="profile-field-input-wrapper">
                  <Mail size={16} className="profile-input-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="maya@example.com"
                    className="profile-field-input"
                    required
                  />
                </div>
                {formErrors.email && <span className="profile-input-error">{formErrors.email}</span>}
              </div>
            </div>

            <div className="profile-form-actions">
              <button
                type="submit"
                className="profile-save-btn"
                disabled={isSavingProfile}
              >
                {isSavingProfile ? (
                  <>
                    <span className="btn-spinner" aria-hidden="true" />
                    <span>Synchronizing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Save Identity Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: Security & Keys */}
      {activeTab === "security" && (
        <div className="profile-panel">
          <div className="profile-panel-header">
            <h2 className="profile-panel-title">
              <KeyRound size={22} style={{ color: "var(--color-amber)" }} />
              <span>Security & Access Keys</span>
            </h2>
            <p className="profile-panel-subtitle">
              Update your secret login password to keep your microadventure clearance secure.
            </p>
          </div>

          <form onSubmit={handleChangePassword}>
            <div className="profile-form-grid">
              <div className="profile-field-group">
                <label className="profile-field-label">
                  <Lock size={14} />
                  <span>Current Password</span>
                </label>
                <div className="profile-field-input-wrapper">
                  <Lock size={16} className="profile-input-icon" />
                  <input
                    type={showCurrentPw ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="profile-field-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw((p) => !p)}
                    style={{ position: "absolute", right: "12px", background: "none", border: "none", cursor: "pointer", color: "#6B7280" }}
                    aria-label="Toggle password visibility"
                  >
                    {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="profile-field-group">
                <label className="profile-field-label">
                  <Lock size={14} />
                  <span>New Password (min 6 chars)</span>
                </label>
                <div className="profile-field-input-wrapper">
                  <Lock size={16} className="profile-input-icon" />
                  <input
                    type={showNewPw ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="profile-field-input"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw((p) => !p)}
                    style={{ position: "absolute", right: "12px", background: "none", border: "none", cursor: "pointer", color: "#6B7280" }}
                    aria-label="Toggle password visibility"
                  >
                    {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="profile-field-group">
                <label className="profile-field-label">
                  <Lock size={14} />
                  <span>Confirm New Password</span>
                </label>
                <div className="profile-field-input-wrapper">
                  <Lock size={16} className="profile-input-icon" />
                  <input
                    type={showNewPw ? "text" : "password"}
                    value={newPassword2}
                    onChange={(e) => setNewPassword2(e.target.value)}
                    placeholder="••••••••"
                    className="profile-field-input"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            </div>

            <div className="profile-form-actions">
              <button
                type="submit"
                className="profile-save-btn"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <>
                    <span className="btn-spinner" aria-hidden="true" />
                    <span>Updating Key...</span>
                  </>
                ) : (
                  <>
                    <KeyRound size={18} />
                    <span>Change Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: Danger Zone */}
      {activeTab === "danger" && (
        <div className="profile-panel">
          <div className="profile-panel-header">
            <h2 className="profile-panel-title" style={{ color: "#DC2626" }}>
              <AlertTriangle size={22} />
              <span>Danger Zone: Account Termination</span>
            </h2>
            <p className="profile-panel-subtitle">
              Irreversible actions that affect your Unplanned explorer account and data.
            </p>
          </div>

          <div className="profile-danger-box">
            <h3 className="profile-danger-title">Permanently Terminate Explorer Account</h3>
            <p className="profile-danger-desc">
              Deleting your account is permanent. All your broadcasted microadventures, join requests, confirmed attendee spots, and explorer history will be immediately and irrevocably purged from the Unplanned radar.
            </p>
            <button
              type="button"
              className="profile-delete-trigger-btn"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              <Trash2 size={16} />
              <span>Delete Account Permanently</span>
            </button>
          </div>
        </div>
      )}

      {/* Account Deletion Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="profile-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="profile-modal-card">
            <div className="profile-modal-alert-icon">
              <AlertTriangle size={28} />
            </div>

            <h2 id="modal-title" className="profile-modal-title">
              Are you absolutely sure?
            </h2>

            <p className="profile-modal-text">
              This action cannot be undone. This will permanently delete your account (<strong>@{profile?.username}</strong>) and all microadventure records from Unplanned.
            </p>

            <label htmlFor="confirm-delete" className="profile-modal-confirm-label">
              Please type <strong>DELETE</strong> to confirm:
            </label>

            <input
              id="confirm-delete"
              type="text"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder="DELETE"
              className="profile-modal-confirm-input"
              autoFocus
            />

            <div className="profile-modal-actions">
              <button
                type="button"
                className="profile-modal-cancel-btn"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteConfirmationText("");
                }}
                disabled={isDeletingAccount}
              >
                Cancel
              </button>

              <button
                type="button"
                className="profile-modal-delete-btn"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmationText !== "DELETE" || isDeletingAccount}
              >
                {isDeletingAccount ? "Terminating..." : "Yes, Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;