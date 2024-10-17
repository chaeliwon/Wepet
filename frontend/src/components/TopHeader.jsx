import React from "react";
import { Link } from "react-router-dom";

const TopHeader = () => {
  return (
    <header className="headerBG">
      <nav className="headerNav">
        <div>
          <Link to="/">
            <img
              className="headerBackBtn"
              src="./static/BackBtnIcon2.png"
              alt=""
            />
          </Link>
        </div>
        <div>
          <Link to="/login">Login</Link>
        </div>
      </nav>
    </header>
  );
};

export default TopHeader;
