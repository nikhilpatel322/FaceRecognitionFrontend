import React from 'react';
import './DashboardPage.css';
import { Link } from 'react-router-dom';

const DashboardPage = ({ role, name, onLogout }) => {
  const menuItems = [
    { path: '/attendance-dashboard', icon: '📊', label: 'Attendance Dashboard' },
    { path: '/set-holidays', icon: '📅', label: 'Set Holidays' },
    { path: '/add-remove-employee', icon: '👥', label: 'Add / Remove Employee' },
    { path: '/manage-leave', icon: '📄', label: 'Manage Leave' },
  ];

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>Nexoris Solutions</h2>
          <p>Facial Recognition System</p>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link to={item.path} className="nav-link">
                  <span className="nav-icon" role="img" aria-label={item.label}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button onClick={onLogout} className="btn btn-outline btn-logout">
            <span className="nav-icon" role="img" aria-label="logout">📛</span>
            Logout
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-content">
            <h1>Welcome, {name}!</h1>
            <p>Select an option from the menu to manage your system.</p>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="dashboard-grid">
            {menuItems.map((item) => (
              <Link to={item.path} key={item.path} className="dashboard-card">
                <span className="card-icon" role="img" aria-label={item.label}>
                  {item.icon}
                </span>
                <h3>{item.label}</h3>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
