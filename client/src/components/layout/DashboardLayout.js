import React from 'react';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => (
  <div className="dashboard-layout">
    <Sidebar />
    <main className="dashboard-main">
      <div className="dashboard-content">
        {children}
      </div>
    </main>
  </div>
);

export default DashboardLayout;
