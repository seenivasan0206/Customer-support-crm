import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import SupportRequests from "./pages/SupportRequests";
import KnowledgeBase from "./pages/KnowledgeBase";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Customers from "./pages/CustomerManagement";
import Agents from "./pages/Agents";
import ConversationsAndLiveChats from "./pages/ConversationsAndLiveChats";
import HelpAndSupport from "./pages/HelpAndSupport";

import "./App.css";

function isSavedLogin() {
  return Boolean(localStorage.getItem("access_token"));
}

function getPageFromUrl() {
  return decodeURIComponent(window.location.hash.replace("#/", ""));
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(isSavedLogin());

  const [activePage, setActivePage] = useState(() => {
    let page = getPageFromUrl();

    if (page === "") {
      page = isSavedLogin() ? "dashboard" : "login";
      window.history.replaceState(null, "", "#/" + page);
    }
    return page;
  });

  useEffect(() => {
    function handleUrlChange() {
      setActivePage(getPageFromUrl());
    }

    window.addEventListener("hashchange", handleUrlChange);
    return () => window.removeEventListener("hashchange", handleUrlChange);
  }, []);

  useEffect(() => {
    if (activePage === "login" && isLoggedIn) {
      sessionStorage.removeItem("isLoggedIn");
      setIsLoggedIn(false);
    }

    if (!isLoggedIn && activePage !== "login") {
      window.history.replaceState(null, "", "#/login");
      setActivePage("login");
    }
  }, [activePage, isLoggedIn]);

  function changePage(page) {
    window.location.hash = "/" + encodeURIComponent(page);
  }

    function handleLogin() {
    sessionStorage.setItem("isLoggedIn", "true");
    setActivePage("dashboard");
    setIsLoggedIn(true);
    window.location.hash = "/dashboard";
  }

  async function handleLogout() {
    const token = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");

    if (token && refreshToken) {
      try {
        await fetch("http://localhost:8000/api/accounts/logout/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ refresh: refreshToken }),
        });
      } catch (err) {
        console.error("Backend logout error:", err);
      }
    }

    localStorage.clear();
    sessionStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    setActivePage("login");
    window.location.hash = "/login";
  }


  if (!isLoggedIn || activePage === "login") {
    return <Login onLogin={handleLogin} />;
  }

  const page = activePage === "" ? "dashboard" : activePage;

  const renderPage = () => {
    const pageLower = page.toLowerCase();

    if (pageLower === "help") {
      return <HelpAndSupport onNavigate={changePage} />;
    }

    if (
      pageLower.includes("support") ||
      pageLower.includes("request") ||
      pageLower.includes("ticket")
    ) {
      return <SupportRequests />;
    }

    switch (pageLower) {
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

      case "help":
        return <HelpAndSupport onNavigate={changePage} />;

      default:
        return <h2>Page Not Found</h2>;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        activePage={page}
        setActivePage={changePage}
        onLogout={handleLogout}
      />

      <div className="main-section">
        <Header
          onLogout={handleLogout}
          onProfileClick={() => changePage("settings")}
          onHelpClick={() => changePage("help")}
        />

        <div className="page-content">{renderPage()}</div>
      </div>
    </div>
  );
}

export default App;
