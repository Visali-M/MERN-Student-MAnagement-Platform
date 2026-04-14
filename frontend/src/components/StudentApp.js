import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiCheckCircle
} from 'react-icons/fi';
import './StudentApp.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/students';

const StudentApp = () => {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    course: '',
    email: '',
    phone: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);

  // Fetch all students
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const endpoint = searchQuery
        ? `${API_URL}/search?query=${searchQuery}`
        : API_URL;
      const response = await axios.get(endpoint);
      setStudents(response.data.data || response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch students. Make sure the backend server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  useEffect(() => {
    if (searchQuery) {
      const timer = setTimeout(() => {
        fetchStudents();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      fetchStudents();
    }
  }, [searchQuery]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'age' ? (value === '' ? '' : parseInt(value)) : value
    }));
  };

  // Validate form
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.age) {
      setError('Age is required');
      return false;
    }
    if (formData.age < 18 || formData.age > 60) {
      setError('Age must be between 18 and 60');
      return false;
    }
    if (!formData.course.trim()) {
      setError('Course is required');
      return false;
    }
    return true;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const dataToSend = {
        name: formData.name.trim(),
        age: formData.age,
        course: formData.course.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim()
      };

      if (editingId) {
        // Update
        await axios.put(`${API_URL}/${editingId}`, dataToSend);
        setSuccess('Student updated successfully!');
        setEditingId(null);
      } else {
        // Create
        await axios.post(API_URL, dataToSend);
        setSuccess('Student added successfully!');
      }

      setFormData({
        name: '',
        age: '',
        course: '',
        email: '',
        phone: ''
      });
      setIsFormVisible(false);
      fetchStudents();
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (student) => {
    setFormData({
      name: student.name,
      age: student.age,
      course: student.course,
      email: student.email || '',
      phone: student.phone || ''
    });
    setEditingId(student._id);
    setIsFormVisible(true);
    setError('');
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        setLoading(true);
        await axios.delete(`${API_URL}/${id}`);
        setSuccess('Student deleted successfully!');
        fetchStudents();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Failed to delete student');
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle cancel edit
  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      name: '',
      age: '',
      course: '',
      email: '',
      phone: ''
    });
    setIsFormVisible(false);
    setError('');
  };

  return (
    <div className="student-app">
      <header className="app-header">
        <div className="header-content">
          <h1>📚 Student Details</h1>
          <p>Manage your student information efficiently</p>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          {/* Alerts */}
          {error && (
            <div className="alert alert-error">
              <FiAlertCircle className="alert-icon" />
              <span>{error}</span>
              <button onClick={() => setError('')} className="alert-close">
                <FiX />
              </button>
            </div>
          )}
          {success && (
            <div className="alert alert-success">
              <FiCheckCircle className="alert-icon" />
              <span>{success}</span>
              <button onClick={() => setSuccess('')} className="alert-close">
                <FiX />
              </button>
            </div>
          )}

          {/* Search Bar */}
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, course, or email..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Add Student Button */}
          {!isFormVisible && (
            <button
              onClick={() => setIsFormVisible(true)}
              className="btn btn-primary btn-add"
            >
              <FiPlus /> Add New Student
            </button>
          )}

          {/* Form */}
          {isFormVisible && (
            <div className="form-container">
              <div className="form-card">
                <h2>
                  {editingId ? '✏️ Edit Student' : '➕ Add New Student'}
                </h2>

                <form onSubmit={handleSubmit} className="form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter full name"
                      />
                    </div>

                    <div className="form-group">
                      <label>Age *</label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        placeholder="18-60"
                        min="18"
                        max="60"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Course *</label>
                      <input
                        type="text"
                        name="course"
                        value={formData.course}
                        onChange={handleInputChange}
                        placeholder="e.g., Computer Science"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Email (Optional)</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="student@example.com"
                      />
                    </div>

                    <div className="form-group">
                      <label>Phone (Optional)</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      <FiCheck /> {editingId ? 'Update Student' : 'Add Student'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="btn btn-secondary"
                      disabled={loading}
                    >
                      <FiX /> Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Students List */}
          <div className="students-container">
            <h2>
              📋 Students List
              {students.length > 0 && <span className="badge">{students.length}</span>}
            </h2>

            {loading && <div className="loading">Loading...</div>}

            {!loading && students.length === 0 ? (
              <div className="empty-state">
                <p>No students found. {searchQuery ? 'Try a different search.' : 'Add one to get started!'}</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="students-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Age</th>
                      <th>Course</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student._id}>
                        <td>
                          <span className="student-name">{student.name}</span>
                        </td>
                        <td>{student.age}</td>
                        <td>
                          <span className="badge-course">{student.course}</span>
                        </td>
                        <td className="text-muted">{student.email || '-'}</td>
                        <td className="text-muted">{student.phone || '-'}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleEdit(student)}
                              className="btn btn-icon btn-edit"
                              title="Edit"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => handleDelete(student._id)}
                              className="btn btn-icon btn-delete"
                              title="Delete"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>MERN Student Management System © 2024</p>
      </footer>
    </div>
  );
};

export default StudentApp;
