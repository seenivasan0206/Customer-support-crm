import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import SupportRequests from "./pages/SupportRequests";
import "./App.css";


function isSavedLogin() {
  return sessionStorage.getItem("isLoggedIn") === "true";
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

  
  function handleLogout() {
    sessionStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    setActivePage("login");
    window.location.hash = "/login";
  }

  
  if (!isLoggedIn || activePage === "login") {
    return <Login onLogin={handleLogin} />;
  }

  const page = activePage === "" ? "dashboard" : activePage;
  const pageLower = page.toLowerCase();

  return (
    <div className="app-layout">
      <Sidebar
        activePage={page}
        setActivePage={changePage}
        onLogout={handleLogout}
      />

      <div className="main-section">
        <Header onLogout={handleLogout} />

        <div className="page-content">
          {pageLower.includes("dashboard") && <Dashboard />}
          {pageLower.includes("support") && <SupportRequests />}

          {}
          {!pageLower.includes("dashboard") &&
            !pageLower.includes("support") && <h2>{page}</h2>}
        </div>
      </div>
    </div>
  );
}

export default App;
