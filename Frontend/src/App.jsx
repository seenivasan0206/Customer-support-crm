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
  return (
    Boolean(localStorage.getItem("access_token")) &&
    sessionStorage.getItem("authenticatedSession") === "true"
  );
}

function getInitialPage() {
  const loggedIn = isSavedLogin();

  if (!loggedIn) {
    window.history.replaceState(null, "", "#/login");
    return "login";
  }

  const navigation = performance.getEntriesByType("navigation")[0];

  if (navigation?.type === "reload") {
    window.history.replaceState(null, "", "#/dashboard");
    return "dashboard";
  }

  const currentPage = decodeURIComponent(
    window.location.hash.replace("#/", ""),
  );

  if (!currentPage || currentPage === "login") {
    window.history.replaceState(null, "", "#/dashboard");
    return "dashboard";
  }

  return currentPage;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => isSavedLogin());

  const [activePage, setActivePage] = useState(() => getInitialPage());

  useEffect(() => {
    function handleUrlChange() {
      const page = decodeURIComponent(window.location.hash.replace("#/", ""));

      setActivePage(page || "dashboard");
    }

    window.addEventListener("hashchange", handleUrlChange);

    return () => {
      window.removeEventListener("hashchange", handleUrlChange);
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn && activePage !== "login") {
      window.history.replaceState(null, "", "#/login");
      setActivePage("login");
    }
  }, [activePage, isLoggedIn]);

  function changePage(page) {
    window.location.hash = "/" + encodeURIComponent(page);
  }

  function handleLogin() {
    sessionStorage.setItem("authenticatedSession", "true");

    setIsLoggedIn(true);
    setActivePage("dashboard");

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
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            refresh: refreshToken,
          }),
        });
      } catch (err) {
        console.error("Backend logout error:", err);
      }
    }

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("username");

    sessionStorage.removeItem("authenticatedSession");

    setIsLoggedIn(false);
    setActivePage("login");

    window.location.hash = "/login";
  }

  if (!isLoggedIn || activePage === "login") {
    return <Login onLogin={handleLogin} />;
  }

  const page = activePage || "dashboard";

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

      default:
        return <Dashboard />;
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
