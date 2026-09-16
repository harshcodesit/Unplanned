import { useEffect, useState, type FC } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Compass, Flame, Footprints, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { DEFAULT_AVATAR_URL, getAvatarUrl } from "../types/user";
import "./Navbar.css";

const Navbar: FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen]);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const handleNavClick = (targetPath: string) => {
    if (location.pathname === targetPath) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header className="nav-header">
      <nav
        className={`navcontainer ${isScrolled ? "scrolled" : ""}`}
        aria-label="Main Navigation"
        role="navigation"
      >

        <Link
          to="/"
          className="navlogo-link"
          aria-label="Unplanned Home"
          onClick={() => handleNavClick("/")}
        >
          <span className="navlogo">Unplanned</span>
        </Link>

        <div className="navlinks desktop-nav" role="menubar">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-btn ${isActive ? "active" : ""}`}
            role="menuitem"
            onClick={() => handleNavClick("/")}
          >
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/vibes"
            className={({ isActive }) => `nav-btn ${isActive ? "active" : ""}`}
            role="menuitem"
            onClick={() => handleNavClick("/vibes")}
          >
            <span>Vibes</span>
          </NavLink>

          <NavLink
            to="/trail"
            className={({ isActive }) => `nav-btn ${isActive ? "active" : ""}`}
            role="menuitem"
            onClick={() => handleNavClick("/trail")}
          >
            <span>Trail</span>
          </NavLink>

          {user ? (
            <div className="nav-user-slot">
              <NavLink
                to="/profile"
                className={({ isActive }) => `nav-btn nav-btn-profile ${isActive ? "active" : ""}`}
                role="menuitem"
                aria-label={`Profile for @${user.username}`}
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
                role="menuitem"
                onClick={() => handleNavClick("/login")}
              >
                <span>Login</span>
              </NavLink>

              <NavLink
                to="/register"
                className={({ isActive }) => `nav-btn nav-btn-cta ${isActive ? "active" : ""}`}
                role="menuitem"
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
          aria-expanded={isMobileOpen}
          aria-controls="mobile-nav-drawer"
          aria-label={isMobileOpen ? "Close navigation menu" : "Open navigation menu"}
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
          aria-hidden="true"
        />
      )}

      <div
        id="mobile-nav-drawer"
        className={`mobile-drawer ${isMobileOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
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
              <NavLink
                to="/profile"
                className={({ isActive }) => `mobile-nav-item ${isActive ? "active" : ""}`}
                onClick={() => {
                  handleNavClick("/profile");
                  setIsMobileOpen(false);
                }}
              >
                <img
                  src={getAvatarUrl(user.avatarUrl)}
                  alt=""
                  className="mobile-user-avatar"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_AVATAR_URL;
                  }}
                />
                <span>Profile (@{user.username})</span>
              </NavLink>
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
