import React from "react";
import Homepage from "./components/Homepage";
import "./App.css";
import BottomNaviBar from "./components/BottomNaviBar";

function App() {
  return (
    <div className="App">
      <div className="mobile-container">
        <Homepage />
      </div>
      <BottomNaviBar />
    </div>
  );
}

export default App;
