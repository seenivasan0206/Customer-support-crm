<<<<<<< HEAD
import React, { useState, useEffect } from "react";
=======
import React, { useState } from "react";

>>>>>>> 257d0af38e81b47770e70753c6801bdf0e11ddb0
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
<<<<<<< HEAD
import SupportRequests from "./pages/SupportRequests";
=======
import KnowledgeBase from "./pages/KnowledgeBase";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Customers from "./pages/CustomersManagement";
import Agents from "./pages/Agents";
import ConversationsAndLiveChats from "./pages/ConversationsAndLiveChats";

>>>>>>> 257d0af38e81b47770e70753c6801bdf0e11ddb0
import "./App.css";


<<<<<<< HEAD
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
=======
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
>>>>>>> 257d0af38e81b47770e70753c6801bdf0e11ddb0

  return (
    <div className="app-layout">
      <Sidebar
<<<<<<< HEAD
        activePage={page}
        setActivePage={changePage}
        onLogout={handleLogout}
=======
        activePage={activePage}
        setActivePage={setActivePage}
>>>>>>> 257d0af38e81b47770e70753c6801bdf0e11ddb0
      />

      <div className="main-section">
        <Header onLogout={handleLogout} />

        <div className="page-content">
<<<<<<< HEAD
          {pageLower.includes("dashboard") && <Dashboard />}
          {pageLower.includes("support") && <SupportRequests />}

          {}
          {!pageLower.includes("dashboard") &&
            !pageLower.includes("support") && <h2>{page}</h2>}
=======
          {renderPage()}
>>>>>>> 257d0af38e81b47770e70753c6801bdf0e11ddb0
        </div>
      </div>
    </div>
  );
}

export default App;