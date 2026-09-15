import { useState, type FC } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Calendar, MapPin, Users } from "lucide-react";
import "./HeroCard.css";

const RADIUS_OPTIONS = ["5 km", "10 km", "25 km", "50 km"];

const HeroCard: FC = () => {
  const [radiusIndex, setRadiusIndex] = useState(1); // Default to 10 km

  const handlePrevRadius = () => {
    setRadiusIndex((prev) => (prev > 0 ? prev - 1 : RADIUS_OPTIONS.length - 1));
  };

  const handleNextRadius = () => {
    setRadiusIndex((prev) => (prev < RADIUS_OPTIONS.length - 1 ? prev + 1 : 0));
  };

  return (
    <section className="hero-card-wrapper" aria-label="Hero Showcase">
      <div className="hero-card-frame">
        {/* Main Inner Canvas with Ambient Rings */}
        <div className="hero-card-canvas">
          {/* Left Column: Mission Kicker & Editorial Copy */}
          <div className="hero-left-content">
            <span className="hero-kicker">SPONTANEOUS</span>
            <h1 className="hero-headline">
              Engineered for everyday microadventures.
            </h1>
            <p className="hero-description">
              Find open vibes, meet verified wanderers near you, and explore with
              privacy-first blurred coordinates wherever your day takes you.
            </p>
          </div>

          {/* Right Column: Clean, Notched Vibe Spark Capsule */}
          <div className="hero-beacon-card">
            {/* Notched Top Tab with Live Status */}
            <div className="beacon-notch-header">
              <span className="beacon-live-indicator">
                <span className="beacon-pulse-dot" />
                <span>Live Spark</span>
              </span>
              <span className="beacon-status-tag">Open</span>
            </div>

            <div className="beacon-card-body">
              <h3 className="beacon-title">Sunset Ridge Gathering</h3>
              <p className="beacon-desc">
                Casual acoustic session and skyline watching as dusk settles over the overlook.
              </p>

              {/* Exact Backend Schema Fields */}
              <div className="beacon-meta-list">
                <div className="beacon-meta-row">
                  <MapPin size={14} className="beacon-icon" />
                  <span>Pine Crest Overlook (~1km fuzzed)</span>
                </div>
                <div className="beacon-meta-row">
                  <Calendar size={14} className="beacon-icon" />
                  <span>Today at 6:00 PM</span>
                </div>
                <div className="beacon-meta-row">
                  <Users size={14} className="beacon-icon" />
                  <span>3 participants joined</span>
                </div>
              </div>

              {/* Host Meta Matching User Schema */}
              <div className="beacon-host-footer">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                  alt="Host avatar"
                  className="beacon-host-img"
                />
                <div className="beacon-host-details">
                  <span className="beacon-host-sub">Hosted by</span>
                  <span className="beacon-host-username">@marcus</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Cutouts: Golden Amber CTA (Left) & Controls (Right) */}
        <div className="hero-bottom-cutouts">
          {/* Left Anchor with Inverted Corner Cutouts */}
          <div className="cutout-left-anchor">
            <Link to="/vibes" className="hero-cta-pill" id="hero-discover-btn">
              <span className="cta-icon-circle">
                <ArrowRight size={20} strokeWidth={2.6} />
              </span>
              <span>Discover Vibes</span>
            </Link>
          </div>

          {/* Right Anchor with Inverted Corner Cutouts & Radius Stepper */}
          <div className="cutout-right-anchor">
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--color-cream)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Radius: {RADIUS_OPTIONS[radiusIndex]}
            </span>
            <button
              type="button"
              onClick={handlePrevRadius}
              className="hero-circle-btn"
              aria-label="Previous radius setting"
            >
              <ArrowLeft size={18} strokeWidth={2.6} />
            </button>
            <button
              type="button"
              onClick={handleNextRadius}
              className="hero-circle-btn"
              aria-label="Next radius setting"
            >
              <ArrowRight size={18} strokeWidth={2.6} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroCard;
