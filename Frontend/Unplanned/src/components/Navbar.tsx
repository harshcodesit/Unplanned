import React from "react";
import "./Navbar.css";

const Navbar = (): React.ReactNode => {
  return (
    <>
      <div className="navcontainer">
        <div className="navlogo">Unplanned</div>
        <div className="navlinks">
          <button className="btn"> Home</button>
          <button className="btn"> Vibes</button>
          <button className="btn"> Trail</button>
          <button className="btn"> Profile</button>
          
        </div>
      </div>
    </>
  );
};

export default Navbar;
