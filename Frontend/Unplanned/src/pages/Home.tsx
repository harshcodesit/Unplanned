import type { FC } from "react";
import HeroCard from "../components/home/HeroCard";
import PillarsSection from "../components/home/PillarsSection";

/**
 * Home Page View
 * Displaying the centerpiece Hero Card and the 3 Spontaneous Mindset Pillars
 */
const Home: FC = () => {
  return (
    <div className="home-page-container">
      {/* 1. Centerpiece Hero with Inverted Cutouts & Live Vibe Beacon Capsule */}
      <HeroCard />

      {/* 2. The Spontaneous Mindset Protocol with Ticket Notches */}
      <PillarsSection />
    </div>
  );
};

export default Home;