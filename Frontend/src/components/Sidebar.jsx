
import React from 'react';

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
  Headset,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

var menuItems = [
  { name: 'Dashboard Overview', id: 'dashboard', icon: LayoutDashboard },
  { name: 'Support Requests', id: 'support', icon: ClipboardList },
  { name: 'Customer Management', id: 'customers', icon: Users },
  { name: 'Conversations & Live Chat', id: 'conversations', icon: MessagesSquare },
  { name: 'Agent Management', id: 'agents', icon: UserRound },
  { name: 'Knowledge Base', id: 'knowledge', icon: BookOpen },
  { name: 'Reports & Analytics', id: 'reports', icon: ChartNoAxesColumn },
  { name: 'Settings & Administration', id: 'settings', icon: Settings }
];

function Sidebar({ activePage, setActivePage }) {
  return (
    <div className="sidebar">

      <div className="brand">
        <div className="brand-icon">
          <Headset size={40} color="white" />
        </div>

        <div className="brand-text">
          <h2>SupportFlow</h2>
          <h3>CRM</h3>
        </div>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
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
                <span className="menu-icon">
                  <Icon size={22} />
                </span>
                <span>{item.name}</span>
              </div>
            </button>
          );
        })}
      </nav>

      <button
        type="button"
        className={activePage === 'help' ? 'help-link active' : 'help-link'}
        onClick={() => setActivePage('help')}
      >
        <CircleHelp size={22} />
        <span>Help & Support</span>
        <ExternalLink size={16} className="help-external" />
      </button>

      <div className="workspace">
        <div className="workspace-icon">
          <Building2 size={24} />
        </div>

        <div className="workspace-info">
          <small>Current Workspace</small>
          <h4>Customer Suppor Team</h4>
          <p>
            <span className="online-dot"></span>
            Online
          </p>
        </div>

        <ChevronDown size={18} />
      </div>

    </div>
  );
}

export default Sidebar;
