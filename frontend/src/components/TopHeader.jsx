import React from "react";
import { Link } from "react-router-dom";

const TopHeader = () => {
  return (
    <header
      style={{
        background: "#FFFFFF",
        padding: "10px",
        color: "white",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
      }}
    >
      <nav
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <Link to="/">
            <img
              style={{ width: "20px", marginLeft: "10px", marginTop: "5px" }}
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
