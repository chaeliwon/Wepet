import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Homepage from "./components/Homepage";
import LoginForm from "./components/LoginForm";
import BottomNaviBar from "./components/BottomNaviBar";
import FindPet from "./components/FindPet";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <div className="mobile-container">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<LoginForm />} />{" "}
            {/* LoginForm 경로 설정 */}
            <Route path="/findpet" element={<FindPet />} />
          </Routes>
        </div>
        <BottomNaviBar />
      </div>
    </Router>
  );
}

export default App;
