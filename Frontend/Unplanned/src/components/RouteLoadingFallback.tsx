import type { FC } from "react";
import { Compass } from "lucide-react";

interface RouteLoadingFallbackProps {
  label?: string;
}

const RouteLoadingFallback: FC<RouteLoadingFallbackProps> = ({ label = "Loading expedition..." }) => {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.25rem",
        padding: "2rem",
      }}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div
        style={{
          position: "relative",
          width: "64px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >

        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "2px solid var(--color-amber, #E5A93C)",
            opacity: 0.4,
            animation: "routePulse 1.8s cubic-bezier(0.16, 1, 0.3, 1) infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "-8px",
            borderRadius: "50%",
            border: "1px dashed rgba(0, 71, 65, 0.25)",
            animation: "routeRotate 12s linear infinite",
          }}
        />

        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: "var(--color-pine, #004741)",
            color: "var(--color-amber, #E5A93C)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 24px rgba(0, 71, 65, 0.25)",
          }}
        >
          <Compass size={24} style={{ animation: "routeWiggle 3s ease-in-out infinite" }} />
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <p
          style={{
            fontFamily: "var(--font-display, sans-serif)",
            fontSize: "0.95rem",
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "var(--color-pine, #004741)",
            margin: 0,
          }}
        >
          {label}
        </p>
        <span
          style={{
            display: "inline-block",
            fontSize: "0.75rem",
            color: "var(--color-muted, #6B7280)",
            marginTop: "0.25rem",
          }}
        >
          Syncing hyperlocal coordinates...
        </span>
      </div>

      <style>{`
        @keyframes routePulse {
          0% { transform: scale(0.85); opacity: 0.8; }
          50% { transform: scale(1.2); opacity: 0.2; }
          100% { transform: scale(0.85); opacity: 0.8; }
        }
        @keyframes routeRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes routeWiggle {
          0%, 100% { transform: rotate(-10deg); }
          50% { transform: rotate(10deg); }
        }
      `}</style>
    </div>
  );
};

export default RouteLoadingFallback;
