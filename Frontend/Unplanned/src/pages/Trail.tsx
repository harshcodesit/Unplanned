import { useEffect, useState, type FC } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  Compass,
  Flame,
  Footprints,
  MapPin,
  Plus,
  Radio,
  Users,
} from "lucide-react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import type {
  HostedSpark,
  HostedSparksResponse,
  JoinedFootprint,
  JoinedFootprintsResponse,
} from "../types/trail";
import { DEFAULT_AVATAR_URL, getAvatarUrl } from "../types/user";
import "./Trail.css";

type TrailFilter = "sparks" | "footprints";

const Trail: FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [hostedSparks, setHostedSparks] = useState<HostedSpark[]>([]);
  const [joinedFootprints, setJoinedFootprints] = useState<JoinedFootprint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<TrailFilter>("sparks");

  useEffect(() => {
    let isMounted = true;

    const fetchTrailRecords = async () => {
      setIsLoading(true);
      try {
        const [hostedRes, joinedRes] = await Promise.all([
          API.get<HostedSparksResponse>("/trail/hosted"),
          API.get<JoinedFootprintsResponse>("/trail/joined"),
        ]);

        if (isMounted) {
          if (hostedRes.data && hostedRes.data.success) {
            setHostedSparks(hostedRes.data.hostedVibes || []);
          }
          if (joinedRes.data && joinedRes.data.success) {
            setJoinedFootprints(joinedRes.data.joinedVibes || []);
          }
        }
      } catch (err: unknown) {
        console.error("Error fetching trail records:", err);
        if (isMounted) {
          toast.error("Could not fetch trail journal. Please try refreshing.", "Trail Sync Error");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchTrailRecords();

    return () => {
      isMounted = false;
    };
  }, []);

  // Strict Date Formatter helper
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Schedule Pending";
    try {
      return new Date(dateStr).toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="trail-container">
      {/* 1. Topographic Field Header (Asymmetric Contour Framing) */}
      <header className="trail-header-card" aria-label="Trail Expedition Chronicle">
        {/* Seamless Ticket Waist Notches */}
        <div className="trail-notch-left" aria-hidden="true" />
        <div className="trail-notch-right" aria-hidden="true" />

        {/* Crown Tab */}
        <div className="trail-header-crown">
          <div className="trail-crown-kicker">
            <span className="trail-pulse-dot" aria-hidden="true" />
            <span>Pathfinder Chronicle & Expedition Log</span>
          </div>
          <span className="trail-crown-meta">
            Wanderer: @{user?.username || "explorer"}
          </span>
        </div>

        {/* Header Body */}
        <div className="trail-header-body">
          <div className="trail-header-top-row">
            <div className="trail-header-titles">
              <span className="trail-badge-chip">
                <Radio size={12} />
                <span>Verified Trail Activity</span>
              </span>
              <h1 className="trail-title">Personal Trail Journal</h1>
              <p className="trail-subtitle">
                A chronological ledger of microadventures initiated by you and spontaneous
                expeditions where your footprint was logged across the community.
              </p>
            </div>

            {/* Quick Metrics Cards */}
            <div className="trail-metrics-strip" aria-label="Trail Summary Statistics">
              <div className="trail-metric-card">
                <div className="trail-metric-icon-box" style={{ color: "var(--color-terracotta)" }}>
                  <Flame size={20} />
                </div>
                <div>
                  <div className="trail-metric-number">{hostedSparks.length}</div>
                  <div className="trail-metric-label">Sparks Hosted</div>
                </div>
              </div>

              <div className="trail-metric-card">
                <div className="trail-metric-icon-box" style={{ color: "var(--color-amber)" }}>
                  <Footprints size={20} />
                </div>
                <div>
                  <div className="trail-metric-number">{joinedFootprints.length}</div>
                  <div className="trail-metric-label">Footprints Joined</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Chronicle Segment Switcher & Quick Actions */}
      <nav className="trail-tabs-bar" aria-label="Filter trail sections">
        <div className="trail-segment-pills" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeFilter === "sparks"}
            className={`trail-pill-btn ${activeFilter === "sparks" ? "active" : ""}`}
            onClick={() => setActiveFilter("sparks")}
          >
            <Flame size={14} />
            <span>Sparks Hosted</span>
            <span className="trail-pill-count">{hostedSparks.length}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeFilter === "footprints"}
            className={`trail-pill-btn ${activeFilter === "footprints" ? "active" : ""}`}
            onClick={() => setActiveFilter("footprints")}
          >
            <Footprints size={14} />
            <span>Footprints Joined</span>
            <span className="trail-pill-count">{joinedFootprints.length}</span>
          </button>
        </div>

        <Link to="/vibes/create" className="trail-new-spark-link">
          <Plus size={16} />
          <span>Ignite New Spark</span>
        </Link>
      </nav>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="trail-cards-grid" aria-label="Loading trail data">
          {[1, 2, 3].map((n) => (
            <div key={n} className="trail-skeleton-card">
              <div className="trail-skeleton-shimmer" style={{ width: "100%", height: "140px" }} />
              <div style={{ padding: "1.25rem" }}>
                <div
                  className="trail-skeleton-shimmer"
                  style={{ width: "40%", height: "14px", marginBottom: "0.75rem" }}
                />
                <div
                  className="trail-skeleton-shimmer"
                  style={{ width: "80%", height: "20px", marginBottom: "0.65rem" }}
                />
                <div
                  className="trail-skeleton-shimmer"
                  style={{ width: "100%", height: "36px", marginBottom: "1rem" }}
                />
                <div className="trail-skeleton-shimmer" style={{ width: "60%", height: "14px" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Content Sections */}
      {!isLoading && (
        <>
          {/* SECTION 1: Sparks Hosted */}
          {activeFilter === "sparks" && (
            <section className="trail-section" aria-labelledby="sparks-heading">
              <div className="trail-section-header">
                <div className="trail-section-title-group">
                  <div className="trail-section-icon-badge sparks" aria-hidden="true">
                    <Flame size={20} />
                  </div>
                  <div>
                    <h2 id="sparks-heading" className="trail-section-heading">
                      Sparks Hosted
                    </h2>
                    <p className="trail-section-sub">
                      Microadventures ignited and hosted by you across the community radar.
                    </p>
                  </div>
                </div>
                <span className="trail-pill-count">{hostedSparks.length} Sparks</span>
              </div>

              {hostedSparks.length > 0 ? (
                <div className="trail-cards-grid">
                  {hostedSparks.map((spark) => {
                    const hasImage = Boolean(spark.image && spark.image.length > 0 && spark.image[0]?.url);
                    const statusClass = (spark.status || "active").toLowerCase();

                    return (
                      <article key={spark._id} className="trail-card">
                        {/* Seamless Card Waist Notches */}
                        <div className="trail-card-notch-l" aria-hidden="true" />
                        <div className="trail-card-notch-r" aria-hidden="true" />

                        {/* Top Thumbnail Banner */}
                        <div className="trail-card-banner">
                          {hasImage ? (
                            <img
                              src={spark.image![0].url}
                              alt={spark.title}
                              className="trail-card-img"
                              loading="lazy"
                            />
                          ) : (
                            <div className="trail-banner-fallback">
                              <Flame size={48} />
                            </div>
                          )}

                          <div className="trail-card-banner-overlay">
                            <span className={`trail-status-tag ${statusClass}`}>
                              {spark.status || "Active"}
                            </span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="trail-card-body">
                          <div className="trail-card-date-badge">
                            <Calendar size={13} style={{ color: "var(--color-amber)" }} />
                            <span>{formatDate(spark.startDate)}</span>
                          </div>

                          <h3 className="trail-card-title">{spark.title}</h3>
                          <p className="trail-card-desc">{spark.description}</p>

                          {/* Real Metadata Fields */}
                          <div className="trail-card-meta-list">
                            <div className="trail-card-meta-item">
                              <MapPin size={13} style={{ color: "var(--color-amber)", flexShrink: 0 }} />
                              <span title={spark.locationName || "Local Rendezvous"}>
                                {spark.locationName || "Local Rendezvous"}
                              </span>
                            </div>
                          </div>

                          {/* Real Participants Stack */}
                          <div className="trail-participants-strip">
                            <div className="trail-avatar-stack">
                                {spark.participants && spark.participants.length > 0 ? (
                                  spark.participants.slice(0, 4).map((p) => (
                                    <img
                                      key={p._id}
                                      src={getAvatarUrl(p.avatarUrl)}
                                      alt={p.name || p.username}
                                      title={`@${p.username}`}
                                      className="trail-avatar-thumb"
                                      onError={(e) => {
                                        e.currentTarget.src = DEFAULT_AVATAR_URL;
                                      }}
                                    />
                                  ))
                                ) : (
                                <span className="trail-participants-count">Awaiting wanderers</span>
                              )}
                            </div>
                            <span className="trail-participants-count">
                              <Users size={12} style={{ display: "inline", marginRight: "4px" }} />
                              {spark.participants?.length || 0} joined
                            </span>
                          </div>
                        </div>

                        {/* Action Footer */}
                        <div className="trail-card-footer">
                          <Link to={`/vibes/${spark._id}`} className="trail-view-btn">
                            <span>View Spark Details</span>
                            <ArrowRight size={14} />
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="trail-empty-card">
                  <div className="trail-empty-icon-orb sparks">
                    <Flame size={32} />
                  </div>
                  <h3 className="trail-empty-title">No Sparks Ignited Yet</h3>
                  <p className="trail-empty-desc">
                    You haven't broadcasted any microadventures yet. Launch a spontaneous rooftop session,
                    acoustic jam, or photography walk on the city radar.
                  </p>
                  <Link to="/vibes/create" className="trail-empty-cta sparks">
                    <Plus size={16} />
                    <span>Ignite Your First Spark</span>
                  </Link>
                </div>
              )}
            </section>
          )}

          {/* SECTION 2: Footprints Joined */}
          {activeFilter === "footprints" && (
            <section className="trail-section" aria-labelledby="footprints-heading">
              <div className="trail-section-header">
                <div className="trail-section-title-group">
                  <div className="trail-section-icon-badge footprints" aria-hidden="true">
                    <Footprints size={20} />
                  </div>
                  <div>
                    <h2 id="footprints-heading" className="trail-section-heading">
                      Footprints Joined
                    </h2>
                    <p className="trail-section-sub">
                      Microadventures where you requested to join and completed your expedition.
                    </p>
                  </div>
                </div>
                <span className="trail-pill-count">{joinedFootprints.length} Footprints</span>
              </div>

              {joinedFootprints.length > 0 ? (
                <div className="trail-cards-grid">
                  {joinedFootprints.map((footprint) => {
                    const hasImage = Boolean(
                      footprint.image && footprint.image.length > 0 && footprint.image[0]?.url
                    );
                    const statusClass = (footprint.status || "active").toLowerCase();

                    return (
                      <article key={footprint._id} className="trail-card">
                        {/* Seamless Card Waist Notches */}
                        <div className="trail-card-notch-l" aria-hidden="true" />
                        <div className="trail-card-notch-r" aria-hidden="true" />

                        {/* Top Thumbnail Banner */}
                        <div className="trail-card-banner">
                          {hasImage ? (
                            <img
                              src={footprint.image![0].url}
                              alt={footprint.title}
                              className="trail-card-img"
                              loading="lazy"
                            />
                          ) : (
                            <div className="trail-banner-fallback">
                              <Footprints size={48} />
                            </div>
                          )}

                          <div className="trail-card-banner-overlay">
                            <span className={`trail-status-tag ${statusClass}`}>
                              {footprint.status || "Joined"}
                            </span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="trail-card-body">
                          <div className="trail-card-date-badge">
                            <Calendar size={13} style={{ color: "var(--color-amber)" }} />
                            <span>{formatDate(footprint.startDate)}</span>
                          </div>

                          <h3 className="trail-card-title">{footprint.title}</h3>
                          <p className="trail-card-desc">{footprint.description}</p>

                          {/* Real Metadata Fields */}
                          <div className="trail-card-meta-list">
                            <div className="trail-card-meta-item">
                              <MapPin size={13} style={{ color: "var(--color-amber)", flexShrink: 0 }} />
                              <span title={footprint.locationName || "Meetup Point"}>
                                {footprint.locationName || "Meetup Point"}
                              </span>
                            </div>
                          </div>

                          {/* Real Creator / Host Details */}
                          {footprint.creator && (
                            <div className="trail-host-strip">
                              <img
                                src={getAvatarUrl(footprint.creator.avatarUrl)}
                                alt={footprint.creator.name || footprint.creator.username}
                                className="trail-host-avatar"
                                onError={(e) => {
                                  e.currentTarget.src = DEFAULT_AVATAR_URL;
                                }}
                              />
                              <div className="trail-host-text">
                                <span className="trail-host-sub">Hosted By</span>
                                <span className="trail-host-name">
                                  {footprint.creator.name || `@${footprint.creator.username}`}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action Footer */}
                        <div className="trail-card-footer">
                          <Link to={`/vibes/${footprint._id}`} className="trail-view-btn">
                            <span>Inspect Expedition</span>
                            <ArrowRight size={14} />
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="trail-empty-card">
                  <div className="trail-empty-icon-orb footprints">
                    <Compass size={32} />
                  </div>
                  <h3 className="trail-empty-title">No Footprints Logged Yet</h3>
                  <p className="trail-empty-desc">
                    You haven't joined any microadventures yet. Explore live beacons on the city radar,
                    send a join request, and log your journey.
                  </p>
                  <Link to="/vibes" className="trail-empty-cta footprints">
                    <Compass size={16} />
                    <span>Explore City Radar</span>
                  </Link>
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default Trail;
