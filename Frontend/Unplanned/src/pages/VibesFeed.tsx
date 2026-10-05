import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Calendar,
  Compass,
  Locate,
  LocateFixed,
  MapPin,
  Navigation,
  Plus,
  Radio,
  RotateCcw,
  Search,
  Sparkles,
  Users,
  ArrowRight,
  X,
} from "lucide-react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import type { Vibe, VibesListResponse } from "../types/vibe";
import { DEFAULT_AVATAR_URL, getAvatarUrl } from "../types/user";
import "./VibesFeed.css";

type FilterTab = "all" | "today" | "open";

const RADIUS_OPTIONS = [5, 10, 25, 50];

const VibesFeed = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const distQueryParam = searchParams.get("dist");
  const initialDist =
    distQueryParam && !isNaN(Number(distQueryParam)) ? Number(distQueryParam) : 10;

  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const [selectedDist, setSelectedDist] = useState<number>(initialDist);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isNearMeActive, setIsNearMeActive] = useState<boolean>(false);

  const fetchVibes = async (coords?: { lat: number; lng: number } | null, dist?: number) => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = {};
      if (coords) {
        params.lat = coords.lat;
        params.lng = coords.lng;
        params.dist = dist ?? selectedDist;
      }
      const res = await API.get<VibesListResponse>("/vibes", { params });
      if (res.data.success) {
        setVibes(res.data.vibes || []);
      }
    } catch (err) {
      console.error("Failed to load vibes:", err);
      toast.error("Could not fetch the live city radar. Please try refreshing.", "Radar Offline");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (distQueryParam && navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserCoords(coords);
          setIsNearMeActive(true);
          fetchVibes(coords, initialDist);
          toast.success(
            `GPS locked: Scanning microadventures within ${initialDist} km!`,
            "Proximity Radar Active"
          );
        },
        (err) => {
          setIsLocating(false);
          console.warn("Auto-geolocation bypassed or denied:", err);
          fetchVibes(null);
          toast.info(
            "Click 'Near Me' to lock radar coordinates to your location.",
            "Location Notice"
          );
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else {
      fetchVibes(null);
    }
  }, []);

  const handleToggleNearMe = () => {
    if (isNearMeActive) {
      setIsNearMeActive(false);
      setUserCoords(null);
      setSearchParams({});
      fetchVibes(null);
      toast.info("Radar switched to global feed.", "Global Radar Active");
      return;
    }

    if (!navigator.geolocation) {
      toast.warning("Geolocation is not supported by your browser.", "GPS Unavailable");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        setIsNearMeActive(true);
        setSearchParams({ dist: String(selectedDist) });
        fetchVibes(coords, selectedDist);
        toast.success(
          `Radar locked: Showing microadventures within ${selectedDist} km.`,
          "Proximity Radar Active"
        );
      },
      (err) => {
        setIsLocating(false);
        console.warn("Geolocation error:", err);
        toast.warning(
          "Could not acquire your location. Please check browser permissions.",
          "GPS Signal Needed"
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSelectRadius = (dist: number) => {
    setSelectedDist(dist);
    setSearchParams({ dist: String(dist) });

    if (isNearMeActive && userCoords) {
      fetchVibes(userCoords, dist);
      toast.info(`Scanning within ${dist} km of your coordinates...`, "Radius Updated");
    } else {
      if (!navigator.geolocation) {
        toast.warning("Geolocation is not supported by your browser.", "GPS Unavailable");
        return;
      }
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserCoords(coords);
          setIsNearMeActive(true);
          fetchVibes(coords, dist);
          toast.success(
            `Radar locked within ${dist} km of your location!`,
            "Proximity Radar Active"
          );
        },
        (err) => {
          setIsLocating(false);
          console.warn("Geolocation error:", err);
          toast.warning(
            "Enable location permissions to filter microadventures by radius.",
            "GPS Required"
          );
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    }
  };

  const formatVibeTime = (dateString: string) => {
    try {
      const d = new Date(dateString);
      const now = new Date();
      const isToday =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();

      const timeStr = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      if (isToday) return `Today at ${timeStr}`;

      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      const isTomorrow =
        d.getDate() === tomorrow.getDate() &&
        d.getMonth() === tomorrow.getMonth() &&
        d.getFullYear() === tomorrow.getFullYear();

      if (isTomorrow) return `Tomorrow at ${timeStr}`;

      const dateStr = d.toLocaleDateString([], { month: "short", day: "numeric" });
      return `${dateStr} at ${timeStr}`;
    } catch {
      return dateString;
    }
  };

  const filteredVibes = vibes.filter((vibe) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      vibe.title.toLowerCase().includes(q) ||
      (vibe.locationName && vibe.locationName.toLowerCase().includes(q)) ||
      vibe.description.toLowerCase().includes(q);

    if (!matchesQuery) return false;

    if (activeTab === "open") {
      const isPast = Boolean(vibe.endDate && new Date(vibe.endDate).getTime() < Date.now());
      return vibe.status === "Open" && !isPast;
    }

    if (activeTab === "today") {
      const d = new Date(vibe.startDate);
      const now = new Date();
      return (
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    }

    return true;
  });

  return (
    <div className="vibes-feed-container">
      <section className="radar-canopy">
        <div className="radar-header-top">
          <div className="radar-status-badge">
            <span className="radar-pulse-dot" />
            <span>
              {isLoading
                ? "Scanning Frequencies..."
                : isNearMeActive
                ? `${vibes.length} Within ${selectedDist}km`
                : `${vibes.length} Microadventures Live`}
            </span>
          </div>

          <Link to="/vibes/create" className="radar-broadcast-btn">
            <Sparkles size={16} />
            <span>Broadcast Microadventure</span>
          </Link>
        </div>

        <div className="radar-title-group">
          <h1 className="radar-title">The City Radar</h1>
          <p className="radar-subtitle">
            Spontaneous gatherings taking place across your city right now. Connect face-to-face, skip
            group chat planning polls, and explore.
          </p>
        </div>
      </section>

      <div className="feed-controls-bar">
        <div className="feed-search-wrap">
          <Search size={18} className="feed-search-icon" />
          <input
            type="text"
            className="feed-search-input"
            placeholder="Search by landmark, vibe, or neighborhood..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="feed-filter-chips">
          <button
            type="button"
            className={`feed-filter-chip ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All Vibes ({vibes.length})
          </button>
          <button
            type="button"
            className={`feed-filter-chip ${activeTab === "today" ? "active" : ""}`}
            onClick={() => setActiveTab("today")}
          >
            Happening Today
          </button>
        </div>
      </div>

      <div className="proximity-radar-bar">
        <div className="proximity-left">
          <button
            type="button"
            className={`near-me-btn ${isNearMeActive ? "active" : ""} ${isLocating ? "locating" : ""}`}
            onClick={handleToggleNearMe}
            disabled={isLocating}
          >
            {isLocating ? (
              <Navigation size={15} className="spin-pulse" />
            ) : isNearMeActive ? (
              <LocateFixed size={15} />
            ) : (
              <Locate size={15} />
            )}
            <span>
              {isLocating
                ? "Locating GPS..."
                : isNearMeActive
                ? "Near Me: Active"
                : "Near Me (Lock Radar)"}
            </span>
          </button>

          <div className="radius-pill-wrap">
            <span className="radius-label">Radius:</span>
            {RADIUS_OPTIONS.map((dist) => (
              <button
                key={dist}
                type="button"
                className={`radius-pill ${selectedDist === dist ? "active" : ""}`}
                onClick={() => handleSelectRadius(dist)}
              >
                {dist} km
              </button>
            ))}
          </div>
        </div>

        {isNearMeActive && userCoords && (
          <div className="proximity-status-tag">
            <Compass size={14} style={{ color: "var(--color-amber)" }} />
            <span>Within {selectedDist} km of GPS</span>
            <button
              type="button"
              className="proximity-reset-btn"
              onClick={handleToggleNearMe}
              title="Clear proximity filter and show global radar"
            >
              <X size={12} />
              <span>Reset to Global</span>
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="vibes-grid">
          {[1, 2, 3].map((n) => (
            <div key={n} className="vibe-skeleton-card">
              <div className="skeleton-shimmer skeleton-title" />
              <div className="skeleton-shimmer skeleton-box" />
              <div className="skeleton-shimmer skeleton-text" />
              <div className="skeleton-shimmer skeleton-text" style={{ width: "60%" }} />
            </div>
          ))}
        </div>
      ) : filteredVibes.length === 0 ? (
        <div className="vibes-empty-state">
          <div className="empty-radar-orb">
            <Radio size={36} />
          </div>
          <h2 className="empty-state-title">No Active Sparks Detected</h2>
          <p className="empty-state-desc">
            {searchQuery
              ? `No microadventures match "${searchQuery}". Try broadening your search or clear filters.`
              : isNearMeActive
              ? `No microadventures detected within ${selectedDist} km of your GPS coordinates. Try expanding your radius to 25 km or 50 km, or reset to the Global Radar.`
              : "Be the wanderer who lights the spark! Broadcast the first spontaneous gathering in your neighborhood."}
          </p>
          {isNearMeActive && !searchQuery ? (
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap", marginTop: "1rem" }}>
              <button
                type="button"
                className="radar-broadcast-btn"
                style={{ backgroundColor: "var(--color-pine)", color: "var(--color-cream)" }}
                onClick={() => handleSelectRadius(50)}
              >
                <Compass size={16} />
                <span>Expand to 50 km</span>
              </button>
              <button
                type="button"
                className="radar-broadcast-btn"
                style={{ backgroundColor: "transparent", border: "1.5px solid var(--color-pine)", color: "var(--color-pine)" }}
                onClick={handleToggleNearMe}
              >
                <RotateCcw size={16} />
                <span>Reset to Global Radar</span>
              </button>
            </div>
          ) : (
            <Link to="/vibes/create" className="radar-broadcast-btn">
              <Plus size={18} />
              <span>Broadcast The First Vibe</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="vibes-grid">
          {filteredVibes.map((vibe) => {
            const isHost = user && vibe.creator && vibe.creator._id === user._id;
            const isParticipant =
              user &&
              vibe.participants &&
              vibe.participants.some((p) => p._id === user._id);
            const hasImages = Boolean(vibe.image && vibe.image.length > 0 && vibe.image[0]?.url);

            const isClosed =
              Boolean(vibe.endDate && new Date(vibe.endDate).getTime() < Date.now()) ||
              vibe.status?.toLowerCase() === "closed";
            const displayStatus = isClosed ? "Closed" : vibe.status;

            return (
              <article key={vibe._id} className="vibe-ticket-card">
                <div className="vibe-ticket-notch-left" />
                <div className="vibe-ticket-notch-right" />

                <div className="vibe-ticket-header">
                  <div className="vibe-ticket-kicker">
                    <Radio size={13} />
                    <span>Microadventure</span>
                  </div>
                  <span className={`vibe-status-pill ${displayStatus}`}>{displayStatus}</span>
                </div>

                <div className="vibe-ticket-body">
                  {hasImages && (
                    <div className="vibe-photo-banner">
                      <img
                        src={vibe.image[0].url}
                        alt={vibe.title}
                        className="vibe-photo-img"
                        loading="lazy"
                      />
                      {vibe.image.length > 1 && (
                        <span className="vibe-photo-count-badge">
                          +{vibe.image.length - 1} photos
                        </span>
                      )}
                    </div>
                  )}

                  <Link to={`/vibes/${vibe._id}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <h3 className="vibe-card-title">{vibe.title}</h3>
                  </Link>
                  <p className="vibe-card-desc">{vibe.description}</p>

                  <div className="vibe-meta-row">
                    <div className="vibe-meta-item">
                      <MapPin size={15} className="vibe-meta-icon" />
                      <span>
                        <span className="vibe-meta-highlight">
                          {vibe.locationName || "Approximate Neighborhood Radius"}
                        </span>
                      </span>
                    </div>

                    <div className="vibe-meta-item">
                      <Calendar size={15} className="vibe-meta-icon" />
                      <span>{formatVibeTime(vibe.startDate)}</span>
                    </div>

                    {vibe.participants && (
                      <div className="vibe-meta-item">
                        <Users size={15} className="vibe-meta-icon" />
                        <span>
                          {vibe.participants.length} {vibe.participants.length === 1 ? "wanderer" : "wanderers"} attending
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="vibe-ticket-perforation" />
                </div>

                <div className="vibe-ticket-footer">
                  <div className="vibe-host-slot">
                    <img
                      src={getAvatarUrl(vibe.creator?.avatarUrl)}
                      alt={vibe.creator?.name || vibe.creator?.username || "Host"}
                      className="vibe-host-avatar"
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_AVATAR_URL;
                      }}
                    />
                    <div className="vibe-host-info">
                      <span className="vibe-host-label">Hosted by</span>
                      <span className="vibe-host-name">
                        @{vibe.creator?.username || "wanderer"}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {isHost && <span className="vibe-host-badge">Your Spark</span>}
                    {isParticipant && (
                      <span className="vibe-host-badge" style={{ color: "#059669", background: "#ECFDF5" }}>
                        ✓ Attending
                      </span>
                    )}

                    <Link to={`/vibes/${vibe._id}`} className="vibe-join-btn">
                      <span>View Details</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Link to="/vibes/create" className="feed-fab">
        <Plus size={20} />
        <span>Broadcast Vibe</span>
      </Link>
    </div>
  );
};

export default VibesFeed;