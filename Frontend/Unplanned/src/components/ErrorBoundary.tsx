import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
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
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
          <div style={{ maxWidth: "480px", textAlign: "center", background: "#fff", padding: "2.5rem", borderRadius: "16px", border: "1px solid #e5e7eb", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}>
            <AlertCircle size={44} style={{ color: "var(--color-terracotta, #C25E3E)", margin: "0 auto 1rem auto" }} />
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, margin: "0 0 0.5rem 0", color: "#111827" }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: "0.95rem", color: "#6b7280", margin: "0 0 1.5rem 0", lineHeight: 1.5 }}>
              An unexpected error occurred while loading this page.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button
                type="button"
                onClick={this.handleReset}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1.2rem", borderRadius: "8px", border: "none", background: "var(--color-pine, #004741)", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: "0.88rem" }}
              >
                <RefreshCw size={15} />
                Try Again
              </button>
              <a
                href="/"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1.2rem", borderRadius: "8px", border: "1px solid #d1d5db", background: "#fff", color: "#374151", textDecoration: "none", fontWeight: 600, fontSize: "0.88rem" }}
              >
                <Home size={15} />
                Go to Home
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
