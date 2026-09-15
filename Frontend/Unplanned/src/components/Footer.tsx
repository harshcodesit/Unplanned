import type { FC } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Compass } from "lucide-react";
import "./Footer.css";

const Footer: FC = () => {
  return (
    <footer className="app-footer" role="contentinfo">
      <div className="app-footer-inner">
        {/* Brand Mission Column */}
        <div className="footer-brand-col">
          <div className="footer-logo-title">
            <Compass size={22} strokeWidth={2.4} />
            <span>Unplanned</span>
          </div>
          <p className="footer-tagline">
            The hyperlocal microadventure platform engineered for spontaneous
            explorers. Discover open sparks with privacy-first blurred coordinates.
          </p>
          <div className="footer-privacy-pill">
            <ShieldCheck size={14} />
            <span>Mathematical Fuzzing: ~1km Radius Privacy</span>
          </div>
        </div>

        {/* Global Navigation Groups */}
        <div className="footer-nav-groups">
          <div>
            <h4 className="footer-col-title">Exploration</h4>
            <ul className="footer-links">
              <li>
                <Link to="/vibes">Live Vibes Feed</Link>
              </li>
              <li>
                <Link to="/trail">Trail History & Sparks</Link>
              </li>
              <li>
                <Link to="/">Local Radar</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="footer-col-title">Account & Aura</h4>
            <ul className="footer-links">
              <li>
                <Link to="/login">Sign In</Link>
              </li>
              <li>
                <Link to="/register">Create Account</Link>
              </li>
              <li>
                <Link to="/profile">My Aura Profile</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Global Bottom Bar */}
      <div className="footer-bottom-bar">
        <span>&copy; {new Date().getFullYear()} Unplanned. All rights reserved.</span>
        <span>Built for Spontaneous Wanderers.</span>
      </div>
    </footer>
  );
};

export default Footer;
