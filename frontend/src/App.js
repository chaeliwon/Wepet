import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Outlet,
} from "react-router-dom";
import Homepage from "./pages/Homepage";
import LoginForm from "./pages/LoginForm";
import BottomNaviBar from "./components/BottomNaviBar";
import FindPet from "./pages/FindPet";
import TopHeader from "./components/TopHeader";

import "./App.css";

function App() {
  function DefaultHeader() {
    return (
      <>
        <TopHeader />
        <Outlet />
      </>
    );
  }

  return (
    <Router>
      <div className="App">
        <div className="mobile-container">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/" element={<DefaultHeader />}>
              <Route path="login" element={<LoginForm />} />
              <Route path="findpet" element={<FindPet />} />
             
            </Route>
          </Routes>
        </div>
        <BottomNaviBar />
      </div> 
    </Router>
  );
}

export default App;
