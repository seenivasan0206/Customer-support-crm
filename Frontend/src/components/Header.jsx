import React from 'react';
import {
  CircleHelp, LogOut
} from 'lucide-react';

function Header({ onLogout, onProfileClick, onHelpClick }) {
  const username = localStorage.getItem("username") || "User";
  const userRole = localStorage.getItem("user_role") || "CUSTOMER";
  const initial = username.charAt(0).toUpperCase();

  return (
    <header className="header">
      <div className="search">
        <input
          type="text"
          placeholder="Search tickets, customers, or articles..."
        />
      </div>

      <div className="header-right">
        <button
          type="button"
          className="header-icon-btn"
          onClick={onHelpClick}
          title="Help & Support"
        >
          <CircleHelp size={22} />
        </button>
        <div
          className="profile"
          title={`${username} (${userRole}) - Settings & Administration`}
          onClick={onProfileClick}
          style={{ cursor: 'pointer' }}
        >
          {initial} <span className="online-dot" />
        </div>
        <button
          className="header-logout-btn"
          onClick={onLogout}
          title="Logout"
          type="button"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
