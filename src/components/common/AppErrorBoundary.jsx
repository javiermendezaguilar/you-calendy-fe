import React from "react";
import * as Sentry from "@sentry/react";

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("AppErrorBoundary caught an error:", error, errorInfo);
    Sentry.captureException(error, {
      extra: {
        componentStack: errorInfo?.componentStack,
      },
      tags: {
        boundary: "AppErrorBoundary",
      },
    });
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const errorMessage = this.state.error?.message || "Unknown render error";

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
          color: "#111827",
          padding: "24px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "720px",
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
            padding: "24px",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 700 }}>
            Frontend runtime error
          </h1>
          <p style={{ marginTop: "12px", marginBottom: "8px", color: "#4b5563" }}>
            The app crashed while rendering. Use this message to identify the broken component.
          </p>
          <pre
            style={{
              margin: 0,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              background: "#111827",
              color: "#f9fafb",
              padding: "16px",
              borderRadius: "12px",
              overflow: "auto",
            }}
          >
            {errorMessage}
          </pre>
        </div>
      </div>
    );
  }
}

export default AppErrorBoundary;
