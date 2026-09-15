import { useEffect, useState, type FC } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Compass, Flame, Footprints, LogOut, User as UserIcon, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar: FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  // Scroll awareness for sticky canopy depth
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer on route change or ESC key
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

  // Lock body scroll when mobile menu is open
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

  const handleLogout = async () => {
    await logout();
    setIsMobileOpen(false);
    navigate("/login");
  };

  return (
    <header className="nav-header">
      <nav
        className={`navcontainer ${isScrolled ? "scrolled" : ""}`}
        aria-label="Main Navigation"
        role="navigation"
      >
        {/* Brand Identity with Amber Spark Accent */}
        <Link to="/" className="navlogo-link" aria-label="Unplanned Home">

          <span className="navlogo">Unplanned</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="navlinks desktop-nav" role="menubar">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-btn ${isActive ? "active" : ""}`}
            role="menuitem"
          >
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/vibes"
            className={({ isActive }) => `nav-btn ${isActive ? "active" : ""}`}
            role="menuitem"
          >
            <span>Vibes</span>
          </NavLink>

          <NavLink
            to="/trail"
            className={({ isActive }) => `nav-btn ${isActive ? "active" : ""}`}
            role="menuitem"
          >
            <span>Trail</span>
          </NavLink>

          {/* Dynamic Profile / Auth Slot */}
          {user ? (
            <div className="nav-user-slot">
              <NavLink
                to="/profile"
                className={({ isActive }) => `nav-btn nav-btn-profile ${isActive ? "active" : ""}`}
                role="menuitem"
                aria-label={`Profile for @${user.username}`}
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="nav-user-avatar" />
                ) : (
                  <UserIcon size={14} className="nav-user-icon" />
                )}
                <span className="nav-user-name">@{user.username}</span>
              </NavLink>

              <button
                type="button"
                onClick={handleLogout}
                className="nav-btn nav-btn-ghost"
                aria-label="Log out of account"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="nav-auth-slot">
              <NavLink
                to="/login"
                className={({ isActive }) => `nav-btn ${isActive ? "active" : ""}`}
                role="menuitem"
              >
                <span>Login</span>
              </NavLink>

              <NavLink
                to="/register"
                className={({ isActive }) => `nav-btn nav-btn-cta ${isActive ? "active" : ""}`}
                role="menuitem"
              >
                <span>Sign Up</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* Mobile Hamburger / Close Toggle Button */}
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

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Navigation Drawer */}
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
              onClick={() => setIsMobileOpen(false)}
            >
              <Compass size={18} className="mobile-item-icon" />
              <span>Home</span>
            </NavLink>

            <NavLink
              to="/vibes"
              className={({ isActive }) => `mobile-nav-item ${isActive ? "active" : ""}`}
              onClick={() => setIsMobileOpen(false)}
            >
              <Flame size={18} className="mobile-item-icon" />
              <span>Vibes</span>
            </NavLink>

            <NavLink
              to="/trail"
              className={({ isActive }) => `mobile-nav-item ${isActive ? "active" : ""}`}
              onClick={() => setIsMobileOpen(false)}
            >
              <Footprints size={18} className="mobile-item-icon" />
              <span>Trail</span>
            </NavLink>
          </div>

          <div className="mobile-drawer-divider" />

          {/* Mobile Auth Slot */}
          {user ? (
            <div className="mobile-user-section">
              <NavLink
                to="/profile"
                className={({ isActive }) => `mobile-nav-item ${isActive ? "active" : ""}`}
                onClick={() => setIsMobileOpen(false)}
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="mobile-user-avatar" />
                ) : (
                  <UserIcon size={18} className="mobile-item-icon" />
                )}
                <span>Profile (@{user.username})</span>
              </NavLink>

              <button
                type="button"
                onClick={handleLogout}
                className="mobile-logout-btn"
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <div className="mobile-auth-actions">
              <NavLink
                to="/login"
                className="mobile-login-btn"
                onClick={() => setIsMobileOpen(false)}
              >
                <span>Login</span>
              </NavLink>

              <NavLink
                to="/register"
                className="mobile-signup-btn"
                onClick={() => setIsMobileOpen(false)}
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
