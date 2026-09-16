import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[Unplanned ErrorBoundary] Uncaught error caught by boundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            minHeight: "65vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem 1.5rem",
          }}
          role="alert"
        >
          <div
            style={{
              maxWidth: "520px",
              width: "100%",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(0, 71, 65, 0.12)",
              borderRadius: "16px",
              padding: "2.5rem 2rem",
              textAlign: "center",
              boxShadow: "0 16px 40px rgba(0, 71, 65, 0.08)",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "rgba(194, 94, 62, 0.12)",
                color: "var(--color-terracotta, #C25E3E)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem auto",
              }}
            >
              <AlertTriangle size={28} />
            </div>

            <h2
              style={{
                fontFamily: "var(--font-display, sans-serif)",
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "var(--color-pine, #004741)",
                margin: "0 0 0.5rem 0",
                letterSpacing: "-0.02em",
              }}
            >
              Expedition Signal Interrupted
            </h2>

            <p
              style={{
                fontFamily: "var(--font-sans, sans-serif)",
                fontSize: "0.925rem",
                color: "var(--color-muted, #6B7280)",
                lineHeight: 1.55,
                margin: "0 0 1.75rem 0",
              }}
            >
              An unexpected disturbance disrupted this sector. Don't worry, your coordinates and expedition data are safe.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <pre
                style={{
                  background: "rgba(0, 71, 65, 0.05)",
                  border: "1px solid rgba(0, 71, 65, 0.1)",
                  borderRadius: "8px",
                  padding: "0.75rem",
                  fontSize: "0.75rem",
                  color: "#991B1B",
                  textAlign: "left",
                  overflowX: "auto",
                  marginBottom: "1.5rem",
                  maxHeight: "120px",
                }}
              >
                {this.state.error.toString()}
              </pre>
            )}

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.75rem",
                justifyContent: "center",
              }}
            >
              <button
                type="button"
                onClick={this.handleReset}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1.25rem",
                  borderRadius: "10px",
                  border: "none",
                  background: "var(--color-pine, #004741)",
                  color: "var(--color-cream, #F9EED9)",
                  fontFamily: "var(--font-sans, sans-serif)",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "opacity 0.2s ease, transform 0.2s ease",
                }}
                onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
                onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <RefreshCw size={16} />
                Try Reconnecting
              </button>

              <a
                href="/"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1.25rem",
                  borderRadius: "10px",
                  border: "1px solid rgba(0, 71, 65, 0.2)",
                  background: "transparent",
                  color: "var(--color-pine, #004741)",
                  fontFamily: "var(--font-sans, sans-serif)",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "background-color 0.2s ease",
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(0, 71, 65, 0.05)")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <Home size={16} />
                Return to Basecamp
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
