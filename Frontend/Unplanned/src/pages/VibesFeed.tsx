import { useEffect, useState, type FC } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Plus,
  Radio,
  Search,
  Sparkles,
  Trash2,
  Users,
  ArrowRight,
} from "lucide-react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import type { JoinRequestResponse, Vibe, VibesListResponse } from "../types/vibe";
import "./VibesFeed.css";

type FilterTab = "all" | "today" | "open";

const VibesFeed: FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [joiningVibeId, setJoiningVibeId] = useState<string | null>(null);
  const [requestedMap, setRequestedMap] = useState<Record<string, boolean>>({});

  const fetchVibes = async () => {
    setIsLoading(true);
    try {
      const res = await API.get<VibesListResponse>("/vibes");
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
    fetchVibes();
  }, []);

  // Format date helper: "Today at 6:30 PM", "Tomorrow at 2:00 PM", or "Sep 18 at 4:00 PM"
  const formatVibeTime = (dateString: string) => {
    try {
      const d = new Date(dateString);
      const now = new Date();
      const isToday =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();

      const timeStr = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

      if (isToday) {
        return `Today at ${timeStr}`;
      }

      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      const isTomorrow =
        d.getDate() === tomorrow.getDate() &&
        d.getMonth() === tomorrow.getMonth() &&
        d.getFullYear() === tomorrow.getFullYear();

      if (isTomorrow) {
        return `Tomorrow at ${timeStr}`;
      }

      const dateStr = d.toLocaleDateString([], { month: "short", day: "numeric" });
      return `${dateStr} at ${timeStr}`;
    } catch {
      return dateString;
    }
  };

  // Join request handler
  const handleRequestJoin = async (vibe: Vibe) => {
    if (!user) {
      toast.warning("Please sign in or create an account to request entry to microadventures.", "Sign In Required");
      navigate("/login", { state: { from: location } });
      return;
    }

    if (vibe.creator._id === user._id) {
      toast.info("You are the host of this microadventure!", "Host Status");
      return;
    }

    setJoiningVibeId(vibe._id);
    try {
      const res = await API.post<JoinRequestResponse>(`/vibes/${vibe._id}/request`);
      if (res.data.success) {
        setRequestedMap((prev) => ({ ...prev, [vibe._id]: true }));
        toast.success(
          res.data.message || "Join request sent! The host has been notified.",
          "Request Sent"
        );
      }
    } catch (err: unknown) {
      interface AxiosErrorResponse {
        response?: {
          data?: {
            errors?: { msg: string }[];
            message?: string;
          };
        };
      }

      const axiosError = err as AxiosErrorResponse;
      const backendErrors = axiosError.response?.data?.errors;
      const singleMessage = axiosError.response?.data?.message;

      if (Array.isArray(backendErrors) && backendErrors.length > 0) {
        toast.warning(backendErrors[0].msg, "Request Notice");
      } else if (singleMessage) {
        toast.warning(singleMessage, "Request Notice");
      } else {
        toast.error("Could not send join request. Please try again.", "Request Error");
      }
    } finally {
      setJoiningVibeId(null);
    }
  };

  // Delete vibe handler for creators
  const handleDeleteVibe = async (vibeId: string) => {
    if (!window.confirm("Are you sure you want to cancel and remove this microadventure?")) {
      return;
    }

    try {
      await API.delete(`/vibes/${vibeId}`);
      toast.success("Microadventure removed from the live radar.", "Vibe Removed");
      setVibes((prev) => prev.filter((v) => v._id !== vibeId));
    } catch (err) {
      console.error("Failed to delete vibe:", err);
      toast.error("Could not delete the microadventure. Try again.", "Delete Error");
    }
  };

  // Filtering
  const filteredVibes = vibes.filter((vibe) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      vibe.title.toLowerCase().includes(q) ||
      (vibe.locationName && vibe.locationName.toLowerCase().includes(q)) ||
      vibe.description.toLowerCase().includes(q);

    if (!matchesQuery) return false;

    if (activeTab === "open") {
      return vibe.status === "Open";
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
      {/* 1. Radar Canopy Header */}
      <section className="radar-canopy" aria-labelledby="radar-heading">
        <div className="radar-header-top">
          <div className="radar-status-badge">
            <span className="radar-pulse-dot" aria-hidden="true" />
            <span>
              {isLoading ? "Scanning Frequencies..." : `${vibes.length} Microadventures Live`}
            </span>
          </div>

          <Link to="/vibes/create" className="radar-broadcast-btn">
            <Sparkles size={16} />
            <span>Broadcast Microadventure</span>
          </Link>
        </div>

        <div className="radar-title-group">
          <h1 id="radar-heading" className="radar-title">
            The City Radar
          </h1>
          <p className="radar-subtitle">
            Spontaneous gatherings taking place across your city right now. Connect face-to-face, skip
            group chat planning polls, and explore.
          </p>
        </div>
      </section>

      {/* 2. Search & Filter Bar */}
      <div className="feed-controls-bar">
        <div className="feed-search-wrap">
          <Search size={18} className="feed-search-icon" aria-hidden="true" />
          <input
            type="text"
            className="feed-search-input"
            placeholder="Search by landmark, vibe, or neighborhood..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search microadventures"
          />
        </div>

        <div className="feed-filter-chips" role="tablist">
          <button
            type="button"
            className={`feed-filter-chip ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
            role="tab"
            aria-selected={activeTab === "all"}
          >
            All Vibes ({vibes.length})
          </button>
          <button
            type="button"
            className={`feed-filter-chip ${activeTab === "today" ? "active" : ""}`}
            onClick={() => setActiveTab("today")}
            role="tab"
            aria-selected={activeTab === "today"}
          >
            Happening Today
          </button>
          <button
            type="button"
            className={`feed-filter-chip ${activeTab === "open" ? "active" : ""}`}
            onClick={() => setActiveTab("open")}
            role="tab"
            aria-selected={activeTab === "open"}
          >
            Open Spots
          </button>
        </div>
      </div>

      {/* 3. Feed Cards Grid / Skeletons / Empty State */}
      {isLoading ? (
        <div className="vibes-grid" aria-label="Loading microadventures">
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
        /* Empty State */
        <div className="vibes-empty-state">
          <div className="empty-radar-orb">
            <Radio size={36} />
          </div>
          <h2 className="empty-state-title">No Active Beacons Detected</h2>
          <p className="empty-state-desc">
            {searchQuery
              ? `No microadventures match "${searchQuery}". Try broadening your search or clear filters.`
              : "Be the wanderer who lights the spark! Broadcast the first spontaneous gathering in your neighborhood."}
          </p>
          <Link to="/vibes/create" className="radar-broadcast-btn">
            <Plus size={18} />
            <span>Broadcast The First Vibe</span>
          </Link>
        </div>
      ) : (
        /* Vibe Cards */
        <div className="vibes-grid">
          {filteredVibes.map((vibe) => {
            const isHost = user && vibe.creator && vibe.creator._id === user._id;
            const isParticipant =
              user &&
              vibe.participants &&
              vibe.participants.some((p) => p._id === user._id);
            const isRequested = requestedMap[vibe._id];
            const hasImages = Boolean(vibe.image && vibe.image.length > 0 && vibe.image[0]?.url);

            return (
              <article key={vibe._id} className="vibe-ticket-card">
                {/* Seamless Ticket Waist Notches */}
                <div className="vibe-ticket-notch-left" aria-hidden="true" />
                <div className="vibe-ticket-notch-right" aria-hidden="true" />

                {/* Notched Top Crown Tab */}
                <div className="vibe-ticket-header">
                  <div className="vibe-ticket-kicker">
                    <Radio size={13} />
                    <span>Microadventure</span>
                  </div>
                  <span className={`vibe-status-pill ${vibe.status}`}>{vibe.status}</span>
                </div>

                {/* Card Body */}
                <div className="vibe-ticket-body">
                  {/* Photo Banner if uploaded */}
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

                  <h3 className="vibe-card-title">{vibe.title}</h3>
                  <p className="vibe-card-desc">{vibe.description}</p>

                  {/* Metadata: Location & Time */}
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

                  {/* Perforation Divider Line */}
                  <div className="vibe-ticket-perforation" aria-hidden="true" />
                </div>

                {/* Card Footer: Host & Action */}
                <div className="vibe-ticket-footer">
                  {/* Host Slot */}
                  <div className="vibe-host-slot">
                    {vibe.creator?.avatarUrl ? (
                      <img
                        src={vibe.creator.avatarUrl}
                        alt={vibe.creator.name || vibe.creator.username}
                        className="vibe-host-avatar"
                      />
                    ) : (
                      <div className="vibe-host-avatar-placeholder">
                        {(vibe.creator?.name || vibe.creator?.username || "W")[0].toUpperCase()}
                      </div>
                    )}
                    <div className="vibe-host-info">
                      <span className="vibe-host-label">Hosted by</span>
                      <span className="vibe-host-name">
                        @{vibe.creator?.username || "wanderer"}
                      </span>
                    </div>
                  </div>

                  {/* Contextual Action Button */}
                  {isHost ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span className="vibe-host-badge">Your Beacon</span>
                      <button
                        type="button"
                        className="vibe-delete-btn"
                        onClick={() => handleDeleteVibe(vibe._id)}
                        aria-label="Delete vibe"
                        title="Cancel & Delete Vibe"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : isParticipant ? (
                    <span className="vibe-host-badge" style={{ color: "#059669", background: "#ECFDF5" }}>
                      ✓ Attending
                    </span>
                  ) : isRequested ? (
                    <span className="vibe-host-badge" style={{ color: "#D97706", background: "#FEF3C7" }}>
                      Pending Approval
                    </span>
                  ) : vibe.status === "Open" ? (
                    <button
                      type="button"
                      className="vibe-join-btn"
                      onClick={() => handleRequestJoin(vibe)}
                      disabled={joiningVibeId === vibe._id}
                    >
                      {joiningVibeId === vibe._id ? (
                        <span>Requesting...</span>
                      ) : (
                        <>
                          <span>Request Entry</span>
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="vibe-host-badge">Closed</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* 4. Floating Action Button (FAB) for seamless vibe creation */}
      <Link to="/vibes/create" className="feed-fab" aria-label="Broadcast Microadventure">
        <Plus size={20} />
        <span>Broadcast Vibe</span>
      </Link>
    </div>
  );
};

export default VibesFeed;