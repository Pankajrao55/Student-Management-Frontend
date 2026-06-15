import { useState, useEffect } from 'react';
import {
  getAllStudents,
  addStudent,
  updateStudent,
  deleteStudent,
} from './api';
import './index.css';

const EMPTY_FORM = { name: '', email: '', branch: '', cgpa: '' };

function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  }

  async function fetchStudents() {
    setLoading(true);
    setServerError('');
    try {
      const res = await getAllStudents();
      setStudents(res.data);
    } catch (err) {
      setServerError(
        'Could not connect to backend. Make sure the Spring Boot server is running on port 8080.'
      );
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      newErrors.email = 'Enter a valid email';
    if (!form.branch.trim()) newErrors.branch = 'Branch is required';
    if (form.cgpa === '' || form.cgpa === null)
      newErrors.cgpa = 'CGPA is required';
    else if (form.cgpa < 0 || form.cgpa > 10)
      newErrors.cgpa = 'CGPA must be between 0 and 10';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const payload = { ...form, cgpa: parseFloat(form.cgpa) };

    try {
      if (editingId) {
        await updateStudent(editingId, payload);
        showToast('Student updated successfully');
      } else {
        await addStudent(payload);
        showToast('Student added successfully');
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
      fetchStudents();
    } catch (err) {
      if (err.response && err.response.data) {
        setErrors(err.response.data);
      } else {
        showToast('Something went wrong. Try again.', 'error');
      }
    }
  }

  function handleEdit(student) {
    setForm({
      name: student.name,
      email: student.email,
      branch: student.branch,
      cgpa: student.cgpa,
    });
    setEditingId(student.id);
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCancelEdit() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setErrors({});
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete student "${name}"? This cannot be undone.`))
      return;
    try {
      await deleteStudent(id);
      showToast('Student deleted');
      fetchStudents();
    } catch (err) {
      showToast('Failed to delete student', 'error');
    }
  }

  const filteredStudents = students.filter((s) => {
    const term = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      s.email.toLowerCase().includes(term) ||
      s.branch.toLowerCase().includes(term)
    );
  });

  function cgpaBadgeClass(cgpa) {
    if (cgpa >= 8) return 'badge badge-good';
    if (cgpa >= 6) return 'badge badge-mid';
    return 'badge badge-low';
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>
            <span className="logo">SM</span> Student Management System
          </h1>
          <p className="subtitle">
            Spring Boot + React Full Stack CRUD Application
          </p>
        </div>
      </header>

      <main className="main">
        {toast && (
          <div className={`toast toast-${toast.type}`}>{toast.message}</div>
        )}

        {serverError && (
          <div className="alert alert-error">
            <strong>Connection Error:</strong> {serverError}
            <button className="btn-retry" onClick={fetchStudents}>
              Retry
            </button>
          </div>
        )}

        <section className="card form-card">
          <h2>{editingId ? 'Edit Student' : 'Add New Student'}</h2>
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="field">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="e.g. John Doe"
                value={form.name}
                onChange={handleChange}
                className={errors.name ? 'input-error' : ''}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="e.g. abc@gmail.com"
                value={form.email}
                onChange={handleChange}
                className={errors.email ? 'input-error' : ''}
              />
              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>

            <div className="field">
              <label htmlFor="branch">Branch</label>
              <input
                id="branch"
                name="branch"
                type="text"
                placeholder="e.g. XYZ..."
                value={form.branch}
                onChange={handleChange}
                className={errors.branch ? 'input-error' : ''}
              />
              {errors.branch && (
                <span className="error-text">{errors.branch}</span>
              )}
            </div>

            <div className="field">
              <label htmlFor="cgpa">CGPA</label>
              <input
                id="cgpa"
                name="cgpa"
                type="number"
                step="0.01"
                min="0"
                max="10"
                placeholder="e.g. 7.5"
                value={form.cgpa}
                onChange={handleChange}
                className={errors.cgpa ? 'input-error' : ''}
              />
              {errors.cgpa && <span className="error-text">{errors.cgpa}</span>}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update Student' : 'Add Student'}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="card table-card">
          <div className="table-header">
            <h2>All Students ({filteredStudents.length})</h2>
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, email, or branch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="empty-state">Loading students...</div>
          ) : filteredStudents.length === 0 ? (
            <div className="empty-state">
              {students.length === 0
                ? 'No students yet. Add your first student above.'
                : 'No students match your search.'}
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Branch</th>
                    <th>CGPA</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td>{student.id}</td>
                      <td className="cell-name">{student.name}</td>
                      <td>{student.email}</td>
                      <td>{student.branch}</td>
                      <td>
                        <span className={cgpaBadgeClass(student.cgpa)}>
                          {student.cgpa}
                        </span>
                      </td>
                      <td className="cell-actions">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEdit(student)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(student.id, student.name)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        Built with Spring Boot, MySQL, JPA &amp; React
      </footer>
    </div>
  );
}

export default App;
