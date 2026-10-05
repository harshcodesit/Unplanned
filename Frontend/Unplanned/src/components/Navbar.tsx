import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Compass,
  Flame,
  Footprints,
  X,
  User as UserIcon,
  PlusCircle,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { DEFAULT_AVATAR_URL, getAvatarUrl } from "../types/user";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const handleNavClick = (targetPath: string) => {
    if (location.pathname === targetPath) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleMobileLogout = async () => {
    try {
      await logout();
      setIsMobileOpen(false);
      toast.success("Signed out successfully. Until your next expedition!", "Expedition Ended");
      navigate("/");
    } catch (err) {
      console.error("Mobile logout error:", err);
      toast.error("Failed to sign out. Please try again.", "Error");
    }
  };

  return (
    <header className="nav-header">
      <nav className={`navcontainer ${isScrolled ? "scrolled" : ""}`}>
        <Link
          to="/"
          className="navlogo-link"
          onClick={() => handleNavClick("/")}
        >
          <span className="navlogo">Unplanned</span>
        </Link>

        <div className="navlinks desktop-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-btn ${isActive ? "active" : ""}`}
            onClick={() => handleNavClick("/")}
          >
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/vibes"
            className={({ isActive }) => `nav-btn ${isActive ? "active" : ""}`}
            onClick={() => handleNavClick("/vibes")}
          >
            <span>Vibes</span>
          </NavLink>

          <NavLink
            to="/trail"
            className={({ isActive }) => `nav-btn ${isActive ? "active" : ""}`}
            onClick={() => handleNavClick("/trail")}
          >
            <span>Trail</span>
          </NavLink>

          {user ? (
            <div className="nav-user-slot">
              <NavLink
                to="/profile"
                className={({ isActive }) => `nav-btn nav-btn-profile ${isActive ? "active" : ""}`}
                onClick={() => handleNavClick("/profile")}
              >
                <img
                  src={getAvatarUrl(user.avatarUrl)}
                  alt=""
                  className="nav-user-avatar"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_AVATAR_URL;
                  }}
                />
                <span className="nav-user-name">@{user.username}</span>
              </NavLink>
            </div>
          ) : (
            <div className="nav-auth-slot">
              <NavLink
                to="/login"
                className={({ isActive }) => `nav-btn ${isActive ? "active" : ""}`}
                onClick={() => handleNavClick("/login")}
              >
                <span>Login</span>
              </NavLink>

              <NavLink
                to="/register"
                className={({ isActive }) => `nav-btn nav-btn-cta ${isActive ? "active" : ""}`}
                onClick={() => handleNavClick("/register")}
              >
                <span>Sign Up</span>
              </NavLink>
            </div>
          )}
        </div>

        <button
          type="button"
          className={`nav-mobile-toggle ${isMobileOpen ? "open" : ""}`}
          onClick={() => setIsMobileOpen((prev) => !prev)}
        >
          {isMobileOpen ? (
            <X size={22} strokeWidth={2.4} />
          ) : (
            <span className="hamburger-box">
              <span className="hamburger-bar" />
              <span className="hamburger-bar" />
              <span className="hamburger-bar" />
            </span>
          )}
        </button>
      </nav>

      {isMobileOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div
        id="mobile-nav-drawer"
        className={`mobile-drawer ${isMobileOpen ? "open" : ""}`}
      >
        <div className="mobile-drawer-content">
          <div className="mobile-nav-list">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `mobile-nav-item ${isActive ? "active" : ""}`}
              onClick={() => {
                handleNavClick("/");
                setIsMobileOpen(false);
              }}
            >
              <Compass size={18} className="mobile-item-icon" />
              <span>Home</span>
            </NavLink>

            <NavLink
              to="/vibes"
              className={({ isActive }) => `mobile-nav-item ${isActive ? "active" : ""}`}
              onClick={() => {
                handleNavClick("/vibes");
                setIsMobileOpen(false);
              }}
            >
              <Flame size={18} className="mobile-item-icon" />
              <span>Vibes</span>
            </NavLink>

            <NavLink
              to="/trail"
              className={({ isActive }) => `mobile-nav-item ${isActive ? "active" : ""}`}
              onClick={() => {
                handleNavClick("/trail");
                setIsMobileOpen(false);
              }}
            >
              <Footprints size={18} className="mobile-item-icon" />
              <span>Trail</span>
            </NavLink>
          </div>

          <div className="mobile-drawer-divider" />

          {user ? (
            <div className="mobile-user-section">
              <Link
                to="/profile"
                className="mobile-profile-card"
                onClick={() => {
                  handleNavClick("/profile");
                  setIsMobileOpen(false);
                }}
              >
                <div className="mobile-profile-avatar-wrap">
                  <img
                    src={getAvatarUrl(user.avatarUrl)}
                    alt=""
                    className="mobile-user-avatar"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_AVATAR_URL;
                    }}
                  />
                  <span className="mobile-profile-status-indicator" />
                </div>
                <div className="mobile-profile-info">
                  <span className="mobile-profile-name">{user.name || "Explorer"}</span>
                  <span className="mobile-profile-handle">@{user.username}</span>
                  <span className="mobile-profile-badge">
                    <span className="mobile-profile-dot" /> Active Explorer
                  </span>
                </div>
                <ChevronRight size={18} className="mobile-profile-arrow" />
              </Link>

              <div className="mobile-user-actions">
                <NavLink
                  to="/vibes/create"
                  className={({ isActive }) =>
                    `mobile-nav-item mobile-action-create ${isActive ? "active" : ""}`
                  }
                  onClick={() => {
                    handleNavClick("/vibes/create");
                    setIsMobileOpen(false);
                  }}
                >
                  <PlusCircle size={18} className="mobile-item-icon" />
                  <span>Spark Microadventure</span>
                </NavLink>

                <NavLink
                  to="/profile"
                  className={({ isActive }) => `mobile-nav-item ${isActive ? "active" : ""}`}
                  onClick={() => {
                    handleNavClick("/profile");
                    setIsMobileOpen(false);
                  }}
                >
                  <UserIcon size={18} className="mobile-item-icon" />
                  <span>Explorer Passport</span>
                </NavLink>

                <button
                  type="button"
                  className="mobile-logout-btn"
                  onClick={handleMobileLogout}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="mobile-auth-actions">
              <NavLink
                to="/login"
                className="mobile-login-btn"
                onClick={() => {
                  handleNavClick("/login");
                  setIsMobileOpen(false);
                }}
              >
                <span>Login</span>
              </NavLink>

              <NavLink
                to="/register"
                className="mobile-signup-btn"
                onClick={() => {
                  handleNavClick("/register");
                  setIsMobileOpen(false);
                }}
              >
                <span>Sign Up</span>
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
