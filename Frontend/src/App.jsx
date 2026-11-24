import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");

  // login aagala na Login page mattum kaattum
  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  // sidebar la click panna activePage maarum, andha peru paarthu page kaattum
  const page = String(activePage).toLowerCase();

  return (
    <div className="app-layout">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      <div className="main-section">
        <Header />

        <div className="page-content">
          {page.includes("dashboard") && <Dashboard />}

          {/* Dashboard thavira matha pages ku ippo page peru mattum kaattum */}
          {!page.includes("dashboard") && <h2>{activePage}</h2>}
        </div>
      </div>
    </div>
  );
}

export default App;
