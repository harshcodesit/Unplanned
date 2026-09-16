import type { FC } from "react";
import HeroCard from "../components/home/HeroCard";
import PillarsSection from "../components/home/PillarsSection";

const Home: FC = () => {
  return (
    <div className="home-page-container">

      <HeroCard />

      <PillarsSection />
    </div>
  );
};

export default Home;