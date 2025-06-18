import React, { useState, useEffect } from 'react';
import './AttendanceDashboardPage.css';

const API_URL = 'http://127.0.0.1:8000';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const AttendanceDashboardPage = () => {
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  // Fetch employees and their attendance
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch employees
        const employeesResponse = await fetch(`${API_URL}/employees/`);
        if (!employeesResponse.ok) throw new Error('Failed to fetch employees');
        const employeesData = await employeesResponse.json();
        setEmployees(employeesData);

        // Fetch attendance for the selected month/year
        if (selectedMonth !== null) {
          const startDate = new Date(selectedYear, selectedMonth, 1);
          const endDate = new Date(selectedYear, selectedMonth + 1, 0);
          
          const attendancePromises = employeesData.map(emp => 
            fetch(`${API_URL}/attendance/${emp.id}?start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`)
              .then(res => res.json())
          );
          
          const attendanceData = await Promise.all(attendancePromises);
          const attendanceMap = {};
          attendanceData.forEach((records, index) => {
            attendanceMap[employeesData[index].id] = records;
          });
          setAttendance(attendanceMap);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth, selectedYear]);

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const handleMonthClick = (monthIndex) => {
    setSelectedMonth(monthIndex);
  };

  const handleBackClick = () => {
    setSelectedMonth(null);
  };

  const getAttendanceStatus = (employeeId, day) => {
    const date = new Date(selectedYear, selectedMonth, day + 1);
    const dateStr = date.toISOString().split('T')[0];
    const employeeAttendance = attendance[employeeId] || [];
    const record = employeeAttendance.find(a => a.date === dateStr);
    return record ? (record.present ? 'P' : 'A') : '-';
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (selectedMonth === null) {
    return (
      <div className="attendance-dashboard">
        <div className="dashboard-header">
          <h1>Attendance Dashboard</h1>
          <div className="year-selector">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="form-control"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="months-grid">
          {months.map((month, index) => (
            <button
              key={month}
              className="month-card"
              onClick={() => handleMonthClick(index)}
            >
              <span className="month-name">{month}</span>
              <span className="month-days">{getDaysInMonth(index, selectedYear)} days</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="attendance-dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <button onClick={handleBackClick} className="btn btn-outline btn-back">
            ← Back to Months
          </button>
          <h1>Attendance Dashboard</h1>
        </div>
        <div className="date-filters">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="form-control"
          >
            {months.map((month, index) => (
              <option key={month} value={index}>
                {month}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="form-control"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="table-container">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Employee Name</th>
                {Array.from({ length: getDaysInMonth(selectedMonth, selectedYear) }, (_, i) => (
                  <th key={i} className="day-column">{i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id}>
                  <td className="employee-id">{emp.id}</td>
                  <td className="employee-name">{emp.name}</td>
                  {Array.from({ length: getDaysInMonth(selectedMonth, selectedYear) }, (_, i) => (
                    <td key={i} className="attendance-cell">
                      {getAttendanceStatus(emp.id, i)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceDashboardPage;
