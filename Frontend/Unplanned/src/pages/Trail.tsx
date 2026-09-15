import type { FC } from "react";

const Trail: FC = () => {
  return (
    <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
      <h1 style={{ fontSize: "2.25rem", color: "var(--color-pine)", marginBottom: "0.75rem", fontWeight: 800 }}>
        Trail Hub
      </h1>
      <p style={{ color: "var(--color-muted)", fontSize: "1.05rem", maxWidth: "600px", margin: "0 auto" }}>
        Your personal footprint journal. Track joined microadventures and monitor sparks you have hosted.
      </p>
    </div>
  );
};

export default Trail;
