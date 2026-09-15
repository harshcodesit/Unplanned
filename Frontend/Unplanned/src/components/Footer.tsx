import type { FC } from "react";
import { Link } from "react-router-dom";
import { Flame } from "lucide-react";
import "./Footer.css";

const Footer: FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer" role="contentinfo" aria-label="Unplanned Global Footer">
      <div className="app-footer-inner">
        {/* Brand & Mission Column */}
        <div className="footer-brand-col">
          <Link to="/" className="footer-logo-link" aria-label="Unplanned Home">
            <span className="footer-logo-text">Unplanned</span>
          </Link>

          <p className="footer-tagline">
            The hyperlocal microadventure platform engineered for spontaneous explorers.
            Discover open sparks with privacy-first blurred coordinates.
          </p>

          <Link to="/vibes/create" className="footer-ignite-btn">
            <Flame size={15} />
            <span>Ignite a Spark</span>
          </Link>
        </div>

        {/* Streamlined Navigation Links */}
        <div className="footer-nav-columns">
          <div className="footer-nav-col">
            <h4 className="footer-nav-col-title">Exploration</h4>
            <ul className="footer-nav-list">
              <li>
                <Link to="/vibes" className="footer-nav-link">
                  Live Vibes
                </Link>
              </li>
              <li>
                <Link to="/trail" className="footer-nav-link">
                  Expedition Trail
                </Link>
              </li>
              <li>
                <Link to="/vibes/create" className="footer-nav-link">
                  Broadcast Spark
                </Link>
              </li>
            </ul>
          </div>

          <div className="footer-nav-col">
            <h4 className="footer-nav-col-title">Account</h4>
            <ul className="footer-nav-list">
              <li>
                <Link to="/profile" className="footer-nav-link">
                  Explorer Profile
                </Link>
              </li>
              <li>
                <Link to="/login" className="footer-nav-link">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="footer-nav-link">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Global Bottom Bar */}
      <div className="footer-bottom-bar">
        <span>&copy; {currentYear} Unplanned. All rights reserved.</span>
        <span>Built for Spontaneous Wanderers.</span>
      </div>
    </footer>
  );
};

export default Footer;
