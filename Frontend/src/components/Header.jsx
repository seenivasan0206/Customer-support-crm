import React from 'react';
import {
  Bell, CircleHelp, ChevronDown
}
from 'lucide-react';
function Header() {
  return (
    <header className="header">
      <div className="search">
        <input
          type="text"
          placeholder="Search tickets, customers, or articles..."
        />
      </div>

      <div className="header-right">
        <Bell size={22}/>
        <CircleHelp size={22}/>
        <div className="profile">JD <span className='online-dot'/></div>
      </div>
      <ChevronDown size={16}/>
    </header>
  );
}

export default Header;