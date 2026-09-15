import { useEffect, useState, type FC } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  Compass,
  ExternalLink,
  Lock,
  MapPin,
  Radio,
  Share2,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { APIProvider, Map, Marker, Circle } from "@vis.gl/react-google-maps";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import type { Vibe, VibeUserRef } from "../types/vibe";
import { DEFAULT_AVATAR_URL, getAvatarUrl } from "../types/user";
import "./VibeDetails.css";

interface VibeDetailsApiResponse {
  success: boolean;
  vibe: Vibe;
  displayLocation: {
    latitude: number;
    longitude: number;
  };
  showActualLocation: boolean;
  exactLocation?: {
    latitude: number;
    longitude: number;
    locationName?: string;
  } | null;
  userRequest?: {
    status: "pending" | "accepted" | "rejected";
    requestedAt?: string;
  } | null;
}

interface JoinRequestItem {
  _id: string;
  vibe: string;
  requester: VibeUserRef & { email?: string };
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

interface VibeRequestsResponse {
  success: boolean;
  count: number;
  requests: JoinRequestItem[];
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

const VibeDetails: FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [vibe, setVibe] = useState<Vibe | null>(null);
  const [displayLocation, setDisplayLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showActualLocation, setShowActualLocation] = useState<boolean>(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Join request state
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [hasRequested, setHasRequested] = useState<boolean>(false);
  const [userRequest, setUserRequest] = useState<{
    status: "pending" | "accepted" | "rejected";
    requestedAt?: string;
  } | null>(null);

  // Host clearance: incoming requests
  const [requests, setRequests] = useState<JoinRequestItem[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState<boolean>(false);

  // Fetch Vibe Details
  const fetchVibeDetails = async () => {
    if (!id) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await API.get<VibeDetailsApiResponse>(`/vibes/${id}`);
      if (res.data.success && res.data.vibe) {
        setVibe(res.data.vibe);
        setDisplayLocation(res.data.displayLocation);
        setShowActualLocation(Boolean(res.data.showActualLocation));
        if (res.data.userRequest) {
          setUserRequest(res.data.userRequest);
          setHasRequested(res.data.userRequest.status === "pending");
        } else {
          setUserRequest(null);
        }
      } else {
        setErrorMsg("Vibe details could not be found.");
      }
    } catch (err: unknown) {
      console.error("Error fetching vibe details:", err);
      interface AxiosErr {
        response?: { data?: { errors?: { msg: string }[] } };
      }
      const e = err as AxiosErr;
      const msg = e.response?.data?.errors?.[0]?.msg || "Could not locate this microadventure on the radar.";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch incoming join requests (if host)
  const fetchHostRequests = async () => {
    if (!id || !user || !vibe || vibe.creator._id !== user._id) return;
    setIsLoadingRequests(true);
    try {
      const res = await API.get<VibeRequestsResponse>(`/vibes/${id}/request`);
      if (res.data.success) {
        setRequests(res.data.requests || []);
      }
    } catch (err) {
      console.warn("Could not load requests:", err);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchVibeDetails();
  }, [id]);

  useEffect(() => {
    if (vibe && user && vibe.creator._id === user._id) {
      fetchHostRequests();
    }
  }, [vibe, user]);

  // Request to Join
  const handleRequestJoin = async () => {
    if (!user) {
      toast.warning("Please sign in or create an account to join microadventures.", "Sign In Required");
      navigate("/login", { state: { from: location } });
      return;
    }

    if (!id) return;

    setIsJoining(true);
    try {
      const res = await API.post(`/vibes/${id}/request`);
      if (res.data.success) {
        setHasRequested(true);
        toast.success(
          "Join request sent to the host! Exact coordinates will unlock once accepted.",
          "Request Sent"
        );
      }
    } catch (err: unknown) {
      interface AxiosErr {
        response?: { data?: { errors?: { msg: string; status?: string }[]; message?: string } };
      }
      const e = err as AxiosErr;
      const errors = e.response?.data?.errors;
      const single = e.response?.data?.message;

      if (errors && errors.length > 0) {
        toast.warning(errors[0].msg, "Request Notice");
        if (errors[0].status === "pending" || errors[0].msg.includes("already")) {
          setHasRequested(true);
        }
      } else if (single) {
        toast.warning(single, "Request Notice");
      } else {
        toast.error("Failed to send join request. Please try again.", "Error");
      }
    } finally {
      setIsJoining(false);
    }
  };

  // Host: Approve request
  const handleAcceptRequest = async (requestId: string) => {
    if (!id) return;
    try {
      const res = await API.patch<{
        success: boolean;
        message: string;
        request: JoinRequestItem;
        vibe?: Vibe;
        displayLocation?: { latitude: number; longitude: number };
        showActualLocation?: boolean;
      }>(`/vibes/${id}/request/${requestId}/accept`);
      if (res.data.success) {
        toast.success("Wanderer approved! They now have clearance and coordinates.", "Request Approved");
        // Update local requests list
        setRequests((prev) =>
          prev.map((r) => (r._id === requestId ? { ...r, status: "accepted" as const } : r))
        );
        if (res.data.vibe) {
          setVibe(res.data.vibe);
        }
        if (res.data.displayLocation) {
          setDisplayLocation(res.data.displayLocation);
        }
        if (res.data.showActualLocation !== undefined) {
          setShowActualLocation(Boolean(res.data.showActualLocation));
        }
        // Refresh vibe to update participants list and confirmed attendees
        fetchVibeDetails();
      }
    } catch (err) {
      console.error("Failed to accept request:", err);
      toast.error("Could not approve request. Try again.", "Approval Error");
    }
  };

  // Host: Decline request
  const handleRejectRequest = async (requestId: string) => {
    if (!id) return;
    try {
      const res = await API.patch(`/vibes/${id}/request/${requestId}/reject`);
      if (res.data.success) {
        toast.info("Request declined.", "Request Updated");
        setRequests((prev) =>
          prev.map((r) => (r._id === requestId ? { ...r, status: "rejected" as const } : r))
        );
      }
    } catch (err) {
      console.error("Failed to decline request:", err);
      toast.error("Could not decline request. Try again.", "Update Error");
    }
  };

  // Host: Close vibe
  const [isClosingVibe, setIsClosingVibe] = useState(false);

  const handleCloseVibe = async () => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to close this microadventure? New join requests will no longer be accepted.")) {
      return;
    }

    setIsClosingVibe(true);
    try {
      const res = await API.put<{ success: boolean; message: string; vibe: Vibe }>(`/vibes/${id}`, {
        status: "Closed",
      });
      if (res.data.success) {
        toast.success("Microadventure closed. No new join requests will be accepted.", "Vibe Closed");
        setVibe((prev) => (prev ? { ...prev, status: "Closed" } : null));
      }
    } catch (err) {
      console.error("Error closing vibe:", err);
      toast.error("Failed to close microadventure.", "Error");
    } finally {
      setIsClosingVibe(false);
    }
  };

  // Host: Delete vibe
  const handleDeleteVibe = async () => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to permanently cancel and remove this microadventure?")) {
      return;
    }

    try {
      await API.delete(`/vibes/${id}`);
      toast.success("Microadventure removed from the live radar.", "Vibe Removed");
      navigate("/vibes", { replace: true });
    } catch (err) {
      console.error("Error deleting vibe:", err);
      toast.error("Failed to delete microadventure.", "Error");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: vibe?.title || "Spontaneous Microadventure",
          text: `Check out this open microadventure on Unplanned: ${vibe?.title}`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!", "Share Link");
    }
  };

  // Format date helper
  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="vibe-details-container">
        <div className="details-skeleton-container">
          <div className="details-skeleton-box skeleton-shimmer" />
          <div className="details-skeleton-box skeleton-shimmer" style={{ minHeight: "420px" }} />
        </div>
      </div>
    );
  }

  // Not Found / Error Fallback
  if (errorMsg || !vibe) {
    return (
      <div className="vibe-details-container">
        <div className="details-not-found">
          <AlertCircle size={44} style={{ color: "var(--color-pine)", marginBottom: "1rem" }} />
          <h2 className="details-title" style={{ fontSize: "1.75rem" }}>
            Spark Not Found
          </h2>
          <p style={{ color: "#4B5563", marginBottom: "2rem" }}>
            {errorMsg || "This microadventure may have concluded, been cancelled, or the radar link is invalid."}
          </p>
          <Link to="/vibes" className="details-back-link">
            <ArrowLeft size={16} />
            <span>Return to The Radar</span>
          </Link>
        </div>
      </div>
    );
  }

  const isHost = Boolean(
    user &&
      vibe &&
      vibe.creator &&
      (vibe.creator._id?.toString() === user._id?.toString())
  );
  const isParticipant = Boolean(
    user &&
      vibe &&
      (vibe.participants?.some(
        (p) => (p._id ? p._id.toString() : String(p)) === user._id?.toString()
      ) || userRequest?.status === "accepted")
  );
  const hasExactLocationAccess = Boolean(showActualLocation || isHost || isParticipant);
  const pendingRequests = requests.filter((r) => r.status === "pending");
  const hasPhotos = vibe.image && vibe.image.length > 0;

  // Auto-expiration check: if endDate has passed, vibe is automatically closed
  const isTimeExpired = Boolean(vibe.endDate && new Date(vibe.endDate).getTime() < Date.now());
  const effectiveStatus = isTimeExpired || vibe.status?.toLowerCase() === "closed" ? "Closed" : vibe.status || "Open";
  const isVibeClosed = effectiveStatus === "Closed";

  const exactCoordinates = {
    latitude: vibe.geometry.coordinates[1],
    longitude: vibe.geometry.coordinates[0],
  };

  const mapCenter = hasExactLocationAccess
    ? exactCoordinates
    : (displayLocation || exactCoordinates);

  return (
    <div className="vibe-details-container">
      {/* 1. Top Navigation Bar */}
      <div className="details-nav-bar">
        <Link to="/vibes" className="details-back-link">
          <ArrowLeft size={16} />
          <span>Back to Radar</span>
        </Link>

        <div className="details-status-group">
          <button
            type="button"
            onClick={handleShare}
            className="details-back-link"
            style={{ background: "#FFFFFF" }}
            aria-label="Share microadventure"
          >
            <Share2 size={15} />
            <span>Share</span>
          </button>
          <span className={`details-step-badge ${isVibeClosed ? "closed" : ""}`}>{effectiveStatus}</span>
        </div>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="details-grid">
        {/* Left Column: Field Ticket Dossier */}
        <article className="details-dossier-card">
          {/* Seamless Ticket Waist Notches */}
          <div className="details-notch-left" aria-hidden="true" />
          <div className="details-notch-right" aria-hidden="true" />

          {/* Notched Crown Header Tab */}
          <div className="details-notched-header">
            <div className="details-kicker-group">
              <Radio size={15} className="details-kicker-icon" />
              <span className="details-kicker-text">Field Dossier</span>
            </div>
            <span className="details-step-badge">{hasExactLocationAccess ? "Exact Locked" : "1km Radius"}</span>
          </div>

          <div className="details-body">
            {/* Title Block */}
            <div className="details-title-block">
              <h1 className="details-title">{vibe.title}</h1>
            </div>

            {/* Key Metadata Strip */}
            <div className="details-key-meta">
              <div className="details-meta-item">
                <MapPin size={18} className="details-meta-icon" />
                <div>
                  <span style={{ fontSize: "0.78rem", color: "#6B7280", display: "block" }}>Location</span>
                  <span className="details-meta-value">
                    {vibe.locationName ||
                      (hasExactLocationAccess
                        ? `${mapCenter.latitude.toFixed(4)}, ${mapCenter.longitude.toFixed(4)}`
                        : "Approximate Neighborhood Zone")}
                  </span>
                </div>
                <span className="details-meta-badge">
                  {hasExactLocationAccess ? "Coordinates Active" : "Protected Radius"}
                </span>
              </div>

              <div className="details-meta-item">
                <Calendar size={18} className="details-meta-icon" />
                <div>
                  <span style={{ fontSize: "0.78rem", color: "#6B7280", display: "block" }}>Rendezvous Time</span>
                  <span className="details-meta-value">{formatDateTime(vibe.startDate)}</span>
                </div>
              </div>

              {vibe.endDate && (
                <div className="details-meta-item">
                  <Clock size={18} className="details-meta-icon" />
                  <div>
                    <span style={{ fontSize: "0.78rem", color: "#6B7280", display: "block" }}>Estimated Wrap</span>
                    <span className="details-meta-value">{formatDateTime(vibe.endDate)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Photo Showcase Gallery */}
            {hasPhotos && (
              <div className="details-gallery">
                <div className="details-gallery-primary">
                  <img
                    src={vibe.image[activePhotoIdx]?.url || vibe.image[0].url}
                    alt={vibe.title}
                    className="details-gallery-img"
                  />
                </div>

                {vibe.image.length > 1 && (
                  <div className="details-thumbnails">
                    {vibe.image.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`details-thumb-btn ${idx === activePhotoIdx ? "active" : ""}`}
                        onClick={() => setActivePhotoIdx(idx)}
                        aria-label={`View photo ${idx + 1}`}
                      >
                        <img src={img.url} alt="" className="details-thumb-img" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Full Plan Description */}
            <div className="details-description-section">
              <h2 className="details-section-title">The Plan & Wanderer Guide</h2>
              <p className="details-description-text">{vibe.description}</p>
            </div>

            {/* Perforation Divider Line */}
            <div className="details-perforation" aria-hidden="true" />

            {/* Trail Host Profile */}
            <div className="details-host-card">
              <div className="details-host-left">
                <img
                  src={getAvatarUrl(vibe.creator.avatarUrl)}
                  alt={vibe.creator.name || vibe.creator.username}
                  className="details-host-avatar"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_AVATAR_URL;
                  }}
                />
                <div className="details-host-name-block">
                  <span className="details-host-role">Trail Host</span>
                  <span className="details-host-name">{vibe.creator.name || vibe.creator.username}</span>
                  <span className="details-host-username">@{vibe.creator.username}</span>
                </div>
              </div>

              {isHost && (
                <div className="details-host-actions">
                  <button
                    type="button"
                    onClick={handleCloseVibe}
                    disabled={isVibeClosed || isClosingVibe}
                    className={`vibe-close-btn ${isVibeClosed ? "closed" : ""}`}
                    title={isVibeClosed ? "This microadventure is already closed" : "Close this microadventure to new join requests"}
                  >
                    <Lock size={13} />
                    <span>{isVibeClosed ? "Vibe Closed" : isClosingVibe ? "Closing..." : "Close Vibe"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteVibe}
                    className="vibe-delete-btn"
                    title="Delete this microadventure"
                  >
                    <Trash2 size={13} />
                    <span>Cancel Vibe</span>
                  </button>
                </div>
              )}
            </div>

            {/* Attendees Roster */}
            <div className="details-attendees-section">
              <h2 className="details-section-title" style={{ fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Users size={16} style={{ color: "var(--color-pine)" }} />
                <span>Wanderers On This Trail ({vibe.participants.length})</span>
              </h2>

              {vibe.participants.length === 0 ? (
                <p style={{ fontSize: "0.85rem", color: "#6B7280", margin: "0.5rem 0 0 0" }}>
                  No wanderers have been cleared for this rendezvous yet. Be the first to join!
                </p>
              ) : (
                <div className="details-attendees-list">
                  {vibe.participants.map((p) => (
                    <div key={p._id} className="details-attendee-chip">
                      <img
                        src={getAvatarUrl(p.avatarUrl)}
                        alt={p.name || p.username}
                        className="details-attendee-avatar"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_AVATAR_URL;
                        }}
                      />
                      <span>@{p.username}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Hub */}
            <div className="details-action-hub">
              {isHost ? (
                /* Host Clearance Management Panel */
                <div className="details-host-panel">
                  {/* Sub-Panel 1: Pending Requests */}
                  <div className="details-host-subpanel">
                    <div className="details-host-panel-header">
                      <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--color-pine)", margin: 0, display: "flex", alignItems: "center", gap: "0.45rem" }}>
                        <Clock size={16} style={{ color: "var(--color-amber)" }} />
                        <span>Pending Join Requests ({pendingRequests.length})</span>
                      </h3>
                    </div>

                    {isLoadingRequests ? (
                      <p style={{ fontSize: "0.82rem", color: "#6B7280" }}>Loading incoming requests...</p>
                    ) : pendingRequests.length === 0 ? (
                      <p style={{ fontSize: "0.84rem", color: "#6B7280", margin: "0.35rem 0 0 0" }}>
                        No pending join requests at this time.
                      </p>
                    ) : (
                      pendingRequests.map((req) => (
                        <div key={req._id} className="details-request-item">
                          <div className="details-requester-info">
                            <img
                              src={getAvatarUrl(req.requester.avatarUrl)}
                              alt={req.requester.name || req.requester.username}
                              className="details-attendee-avatar"
                              onError={(e) => {
                                e.currentTarget.src = DEFAULT_AVATAR_URL;
                              }}
                            />
                            <div>
                              <span style={{ fontSize: "0.88rem", fontWeight: 700, display: "block" }}>
                                {req.requester.name || `@${req.requester.username}`}
                              </span>
                              <span style={{ fontSize: "0.72rem", color: "#6B7280" }}>
                                @{req.requester.username} • {new Date(req.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                              </span>
                            </div>
                          </div>

                          <div className="details-req-btn-group">
                            <button
                              type="button"
                              className="details-req-accept-btn"
                              onClick={() => handleAcceptRequest(req._id)}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="details-req-reject-btn"
                              onClick={() => handleRejectRequest(req._id)}
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Sub-Panel 2: Dedicated Confirmed Attendees List */}
                  <div className="details-host-subpanel" style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1.5px solid rgba(0, 71, 65, 0.1)" }}>
                    <div className="details-host-panel-header">
                      <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--color-pine)", margin: 0, display: "flex", alignItems: "center", gap: "0.45rem" }}>
                        <UserCheck size={16} style={{ color: "#10B981" }} />
                        <span>Confirmed Attendees List ({vibe.participants.length})</span>
                      </h3>
                    </div>

                    {vibe.participants.length === 0 ? (
                      <p style={{ fontSize: "0.84rem", color: "#6B7280", margin: "0.35rem 0 0 0" }}>
                        No wanderers have joined this expedition yet.
                      </p>
                    ) : (
                      <div className="details-host-attendees-list">
                        {vibe.participants.map((attendee) => (
                          <div key={attendee._id} className="details-host-attendee-item">
                            <div className="details-requester-info">
                              <img
                                src={getAvatarUrl(attendee.avatarUrl)}
                                alt={attendee.name || attendee.username}
                                className="details-attendee-avatar"
                                onError={(e) => {
                                  e.currentTarget.src = DEFAULT_AVATAR_URL;
                                }}
                              />
                              <div>
                                <span style={{ fontSize: "0.88rem", fontWeight: 700, display: "block" }}>
                                  {attendee.name || `@${attendee.username}`}
                                </span>
                                <span style={{ fontSize: "0.74rem", color: "#6B7280" }}>
                                  @{attendee.username}
                                </span>
                              </div>
                            </div>
                            <span className="details-attendee-status-badge">
                              <span className="attendee-status-dot" />
                              <span>Cleared</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : isParticipant ? (
                /* Attending Banner */
                <div className="details-attending-banner">
                  <UserCheck size={20} />
                  <span>You're approved for this microadventure! See you at the rendezvous spot.</span>
                </div>
              ) : hasRequested ? (
                /* Request Pending */
                <div className="details-pending-banner">
                  <Clock size={20} />
                  <span>Join request pending! The host will review and exact coordinates will unlock.</span>
                </div>
              ) : isVibeClosed ? (
                /* Closed microadventure */
                <div className="details-pending-banner details-closed-banner">
                  <Lock size={20} />
                  <span>This microadventure has concluded and is closed to new join requests.</span>
                </div>
              ) : (
                /* Request Entry CTA */
                <button
                  type="button"
                  className="details-join-btn"
                  onClick={handleRequestJoin}
                  disabled={isJoining}
                >
                  {isJoining ? (
                    <>
                      <span className="btn-spinner" aria-hidden="true" />
                      <span>Transmitting Request...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      <span>Request To Join Microadventure</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </article>

        {/* Right Column: Google Maps Capsule */}
        <aside className="details-map-capsule" aria-label="Interactive Map Location">
          <div className="details-map-header">
            <h2 className="details-map-title">
              <Compass size={18} style={{ color: "var(--color-amber)" }} />
              <span>Location Radar</span>
            </h2>
            <span className="details-map-badge">
              {hasExactLocationAccess ? "Exact Coordinates" : "Approx. 1km Radius"}
            </span>
          </div>

          {/* If exact location unlocked, show exact coordinate pill & directions action */}
          {hasExactLocationAccess && (
            <div className="details-map-exact-banner">
              <div className="details-map-exact-coords">
                <span className="details-map-exact-label">
                  {isHost ? "Host Clearance" : "Approved Wanderer"}
                </span>
                <span className="details-map-exact-val">
                  {mapCenter.latitude.toFixed(5)}, {mapCenter.longitude.toFixed(5)}
                </span>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapCenter.latitude},${mapCenter.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="details-map-directions-btn"
              >
                <span>Navigate</span>
                <ExternalLink size={13} />
              </a>
            </div>
          )}

          {/* Interactive Google Map */}
          <div className="details-map-frame">
            {GOOGLE_MAPS_API_KEY ? (
              <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                <Map
                  key={`map-${mapCenter.latitude}-${mapCenter.longitude}-${hasExactLocationAccess}`}
                  defaultCenter={{ lat: mapCenter.latitude, lng: mapCenter.longitude }}
                  center={{ lat: mapCenter.latitude, lng: mapCenter.longitude }}
                  defaultZoom={hasExactLocationAccess ? 16 : 13}
                  zoom={hasExactLocationAccess ? 16 : 13}
                  gestureHandling="cooperative"
                  disableDefaultUI={false}
                  mapTypeId="roadmap"
                  style={{ width: "100%", height: "100%" }}
                >
                  {hasExactLocationAccess ? (
                    <Marker
                      position={{ lat: mapCenter.latitude, lng: mapCenter.longitude }}
                      title={vibe.locationName || vibe.title}
                    />
                  ) : (
                    <>
                      {/* Approximate Privacy Circle (1000 meters / 1km) */}
                      <Circle
                        center={{ lat: mapCenter.latitude, lng: mapCenter.longitude }}
                        radius={1000}
                        options={{
                          strokeColor: "#E5A93C",
                          strokeOpacity: 0.85,
                          strokeWeight: 2,
                          fillColor: "#004741",
                          fillOpacity: 0.28,
                        }}
                      />
                      <Marker
                        position={{ lat: mapCenter.latitude, lng: mapCenter.longitude }}
                        title="Approximate Neighborhood Zone"
                      />
                    </>
                  )}
                </Map>
              </APIProvider>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#9CA3AF" }}>
                <span>Map visualizer requires Google Maps API key</span>
              </div>
            )}
          </div>

          {/* Privacy Guarantee Explanation */}
          <div className="details-map-privacy">
            <ShieldCheck size={20} className="details-map-privacy-icon" />
            <div>
              <strong style={{ color: "#FFFFFF", display: "block", marginBottom: "2px" }}>
                {hasExactLocationAccess ? "Precise Rendezvous Active" : "Wanderer Privacy Radius"}
              </strong>
              {hasExactLocationAccess
                ? isHost
                  ? "You have Host Clearance: displaying exact coordinates and pinpoint location."
                  : "Your join request has been approved by the host: exact coordinates and directions are unlocked."
                : "Exact street coordinates stay protected within this approximate 1km safe zone until your join request is approved by the host."}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default VibeDetails;
