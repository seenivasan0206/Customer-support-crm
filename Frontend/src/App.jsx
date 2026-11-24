import React, { useState } from "react";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import KnowledgeBase from "./pages/KnowledgeBase";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Customers from "./pages/CustomersManagement";
import Agents from "./pages/Agents";
import ConversationsAndLiveChats from "./pages/ConversationsAndLiveChats";

import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");

  // Show Login page if user is not logged in
  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  // Render the selected page
  const renderPage = () => {
    switch (activePage.toLowerCase()) {
      case "dashboard":
        return <Dashboard />;

      case "knowledge":
        return <KnowledgeBase />;

      case "reports":
        return <Reports />;

      case "settings":
        return <Settings />;

      case "agents":
        return <Agents />;

      case "customers":
        return <Customers />;

      case "conversations":
        return <ConversationsAndLiveChats />;

      default:
        return <h2>Page Not Found</h2>;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <div className="main-section">
        <Header />

        <div className="page-content">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}

export default App;