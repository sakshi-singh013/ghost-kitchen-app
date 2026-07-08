import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './DashboardLayout.css';

function DashboardLayout({ children, activePage, onNavigate }) {
  return (
    <div className="dash-layout">
      <Sidebar active={activePage} onNavigate={onNavigate} />
      <div className="dash-main">
        <Topbar activePage={activePage} />
        <main className="dash-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
