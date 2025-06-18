import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AttendanceDashboardPage from './pages/AttendanceDashboardPage';
import AddRemoveEmployeePage from './pages/AddRemoveEmployeePage';
import HolidayManagement from "./pages/HolidayManagement.jsx";

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const navigate = useNavigate();

  const handleLogin = (email, password) => {
    if (email === 'ADMIN' && password === 'Admin@Nexoris') {
      navigate('/dashboard', { state: { role: 'admin', name: email } });
    } else {
      alert('❌ Invalid credentials. Please try again!');
    }
  };

  const handleMarkAttendance = () => {
    alert('📸 Attendance marked (simulated)!');
  };

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <WelcomePage 
            onProceed={() => navigate('/login')} 
            onMarkAttendance={handleMarkAttendance} 
          />
        } 
      />
      <Route 
        path="/login" 
        element={<LoginPage onLogin={handleLogin} />} 
      />
      <Route 
        path="/dashboard" 
        element={<DashboardPageWithNav />} 
      />
      <Route 
        path="/attendance-dashboard" 
        element={<AttendanceDashboardPage />} 
      />
      <Route 
        path="/add-remove-employee" 
        element={<AddRemoveEmployeePage />} 
      />
      <Route 
        path="/set-holidays" 
        element={<HolidayManagement />} 
      />
    </Routes>
  );
}

function DashboardPageWithNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role || 'admin';
  const name = location.state?.name || 'ADMIN';

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <DashboardPage role={role} name={name} onLogout={handleLogout} />
  );
}

export default AppWrapper;
