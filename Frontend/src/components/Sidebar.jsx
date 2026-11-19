import React from "react";

import {
  LayoutDashboard,
  ClipboardList,
  Users,
  MessagesSquare,
  UserRound,
  BookOpen,
  ChartNoAxesColumn,
  Settings,
  CircleHelp,
  Building2,
  Icon,
  Headset
} from 'lucide-react';

const menuItems=[
  {name:'Dashboard Overview', id:'dashboard', icon:LayoutDashboard},
  {name:'Support Requests', id:'support', icon:ClipboardList},
  {name:'Customer management', id:'customers', icon:Users},
  {name:'Conversations & Live Chats', id:'conversations', icon:MessagesSquare},
  {name:'Agent Management', id:'agents', icon:UserRound},
  {name:'Knowledge Base', id:'knowledge', icon:BookOpen},
  {name:'Reports & Anaytics', id:'reports', icon:ChartNoAxesColumn},
  {name:'Settings & Administration', id:'settings', icon:Settings}
];
function Sidebar({activePage,setActivePage}){
  return(
    
    <div className="sidebar">
      <div className="brand">
        <div className="icon"><Headset size={30} color="white"/></div>

        <div>
          <h2>Suppor Flow</h2>
          <h3>CRM</h3>
        </div>
      </div>

  <nav className="sidebar-menu">
    {menuItems.map((item) => (
      <button
        key={item.id}
        className={
          activePage === item.id
            ? 'sidebar-link active'
            : 'sidebar-link'
        }
        onClick={() => setActivePage(item.id)}
      >
        <div className="menu-item-content">
          <item.icon size={20}/>
          <span>{item.name}</span>
        </div>
      </button>
    ))}
  
  </nav>

    <div className="help-link">
  <span>ⓘ</span>
  <span>Help & Support</span>
  <span>↗️</span>
</div>

<div className="workspace">
  <div className="workspace-icon">▦</div>

  <div>
    <small>Current Workspace</small>
    <h4>Customer Support Team</h4>
    <p>🟢 Online</p>
  </div>

  <span>⌄</span>
</div>

</div>
);
}

export default Sidebar;