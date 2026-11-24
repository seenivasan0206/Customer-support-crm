import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/CustomersManagement';
import Agents from './pages/Agents';
import ConversationsAndLiveChats from './pages/ConversationsAndLiveChats';
import './App.css';

function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="app-layout">

      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <div className="main-section">

        <Header />

        <div className="page-content">

          {activePage === 'dashboard' ? (
            <Dashboard />
          ) : activePage === 'customers' ? (
            <Customers />
          ) : activePage === 'agents' ? (
            <Agents />
          ) : activePage === 'conversations' ? (
            <ConversationsAndLiveChats />
          ) : (
            <h2>{activePage}</h2>
          )}

        </div>

      </div>

    </div>
  );
}

export default App;