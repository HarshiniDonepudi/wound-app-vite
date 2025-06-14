import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const AddAnnotatorPage = () => {
  const { currentUser } = useAuth();
  const [form, setForm] = useState({ full_name: '', username: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  if (!currentUser || currentUser.role !== 'admin') {
    return <div>Access denied. Admins only.</div>;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/add-annotator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setForm({ full_name: '', username: '', email: '' });
      } else {
        setError(data.error || 'Failed to add annotator');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-annotator-container">
      <h2>Add Annotator</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Full Name</label>
          <input name="full_name" value={form.full_name} onChange={handleChange} required />
        </div>
        <div>
          <label>Username</label>
          <input name="username" value={form.username} onChange={handleChange} required />
        </div>
        <div>
          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Annotator'}</button>
      </form>
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default AddAnnotatorPage; 