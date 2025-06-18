import React, { useState, useEffect, useRef } from 'react';
import './AddRemoveEmployeePage.css';

const API_URL = 'http://localhost:8000';

const AddRemoveEmployeePage = () => {
  const [employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState({
    id: '',
    name: '',
    email: '',
    department: '',
    position: '',
    photo: null
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Fetch employees from SQLite via FastAPI
  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_URL}/employees/`);
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      const data = await response.json();
      setEmployees(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to load employees. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please make sure you have granted camera permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current video frame on the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to base64 image
      const photoData = canvas.toDataURL('image/jpeg');
      setNewEmployee(prev => ({ ...prev, photo: photoData }));
      
      // Stop camera after capturing
      stopCamera();
      setShowCamera(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/employees/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEmployee),
      });

      if (response.ok) {
        setShowForm(false);
        setNewEmployee({
          id: '',
          name: '',
          email: '',
          department: '',
          position: '',
          photo: null
        });
        await fetchEmployees();
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to add employee');
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      alert('Failed to add employee. Please try again.');
    }
  };

  const handleRemoveEmployee = async (id) => {
    if (window.confirm('Are you sure you want to remove this employee?')) {
      try {
        const response = await fetch(`${API_URL}/employees/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          alert(errorData.detail || 'Failed to remove employee');
          return;
        }

        setEmployees(prev => prev.filter(emp => emp.id !== id));
        alert('Employee removed successfully!');
      } catch (err) {
        console.error('Error removing employee:', err);
        alert('Failed to remove employee. Please try again.');
      }
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="employee-management">
        <div className="loading-state">
          <p>Loading employees...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="employee-management">
        <div className="error-state">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-management">
      <div className="page-header">
        <h1>Employee Management</h1>
        <p>Add or remove employees from the system</p>
      </div>

      <div className="management-grid">
        <div className="add-employee-section">
          {showForm ? (
            <div className="employee-form">
              <h2>Add New Employee</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="id">Employee ID *</label>
                  <input
                    type="text"
                    id="id"
                    name="id"
                    value={newEmployee.id}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Enter employee ID"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newEmployee.name}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={newEmployee.email}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Enter email address"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={newEmployee.department}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Enter department"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="position">Position</label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={newEmployee.position}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Enter position"
                  />
                </div>

                {!showCamera ? (
                  <button type="button" onClick={() => {
                    setShowCamera(true);
                    startCamera();
                  }}>
                    Take Photo
                  </button>
                ) : (
                  <div className="camera-container">
                    <video ref={videoRef} autoPlay playsInline />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    <div className="camera-buttons">
                      <button type="button" onClick={capturePhoto}>Capture</button>
                      <button type="button" onClick={() => {
                        stopCamera();
                        setShowCamera(false);
                      }}>Cancel</button>
                    </div>
                  </div>
                )}

                {newEmployee.photo && (
                  <div className="photo-preview">
                    <img src={newEmployee.photo} alt="Employee" />
                    <button type="button" onClick={() => setNewEmployee(prev => ({ ...prev, photo: null }))}>
                      Remove Photo
                    </button>
                  </div>
                )}

                <div className="form-buttons">
                  <button type="submit">Add Employee</button>
                  <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          ) : (
            <button className="add-button" onClick={() => setShowForm(true)}>
              Add Employee
            </button>
          )}
        </div>

        <div className="employee-list-section">
          <div className="list-header">
            <h2>Employee List</h2>
            <div className="search-box">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control"
                placeholder="Search employees..."
              />
            </div>
          </div>

          <div className="employee-list">
            {filteredEmployees.length === 0 ? (
              <div className="no-employees">
                <p>No employees found</p>
              </div>
            ) : (
              filteredEmployees.map(emp => (
                <div key={emp.id} className="employee-card">
                  {emp.photo && (
                    <div className="employee-photo">
                      <img src={emp.photo} alt={emp.name} />
                    </div>
                  )}
                  <div className="employee-info">
                    <h3>{emp.name}</h3>
                    <p className="employee-id">ID: {emp.id}</p>
                    {emp.email && <p className="employee-email">{emp.email}</p>}
                    {emp.department && <p className="employee-department">{emp.department}</p>}
                    {emp.position && <p className="employee-position">{emp.position}</p>}
                  </div>
                  <button
                    onClick={() => handleRemoveEmployee(emp.id)}
                    className="btn btn-outline btn-remove"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRemoveEmployeePage; 