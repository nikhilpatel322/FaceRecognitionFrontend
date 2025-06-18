import React, { useState, useEffect } from 'react';
import './WelcomePage.css';

function WelcomePage({ onProceed, onMarkAttendance }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString();
  const formattedDate = time.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <div className="welcome-header">
          <h1>Nexoris Solutions</h1>
          <h2>Facial Recognition Attendance System</h2>
        </div>

        <div className="welcome-time">
          <div className="time-display">{formattedTime}</div>
          <div className="date-display">{formattedDate}</div>
        </div>

        <div className="welcome-actions">
          <button
            onClick={onMarkAttendance}
            className="btn btn-primary btn-mark-attendance"
          >
            <span className="icon">📸</span>
            Mark Attendance
          </button>

          <button
            onClick={onProceed}
            className="btn btn-outline btn-admin-login"
          >
            Proceed to Admin Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default WelcomePage;
