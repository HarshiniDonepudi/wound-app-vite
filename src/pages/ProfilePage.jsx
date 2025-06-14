import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const cardStyle = {
  background: '#fff',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
  padding: '2em',
  maxWidth: '400px',
  margin: '2em auto',
};
const sectionTitle = {
  fontSize: '1.5em',
  marginBottom: '1em',
  color: '#2d3748',
  fontWeight: 600,
};
const labelStyle = {
  display: 'block',
  marginBottom: '0.5em',
  color: '#4a5568',
  fontWeight: 500,
};
const inputStyle = {
  width: '100%',
  padding: '0.5em',
  marginBottom: '1em',
  border: '1px solid #cbd5e0',
  borderRadius: '4px',
  fontSize: '1em',
};
const buttonStyle = {
  background: '#3182ce',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  padding: '0.7em 1.5em',
  fontSize: '1em',
  fontWeight: 600,
  cursor: 'pointer',
  marginTop: '0.5em',
};
const messageStyle = {
  margin: '1em 0',
  padding: '1em',
  borderRadius: '4px',
  fontWeight: 500,
};
const successStyle = {
  ...messageStyle,
  background: '#e6fffa',
  color: '#2c7a7b',
  border: '1px solid #b2f5ea',
};
const errorStyle = {
  ...messageStyle,
  background: '#fff5f5',
  color: '#c53030',
  border: '1px solid #fed7d7',
};

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const [form, setForm] = useState({ old_password: '', new_password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  if (!currentUser) return <div>Access denied.</div>;

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
      const res = await fetch('/api/auth/change-password', {
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
        setForm({ old_password: '', new_password: '' });
      } else {
        setError(data.error || 'Failed to change password');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={cardStyle}>
      <div style={sectionTitle}>Profile</div>
      <div style={{marginBottom:'1.5em'}}>
        <div><strong>Name:</strong> {currentUser.full_name}</div>
        <div><strong>Username:</strong> {currentUser.username}</div>
        <div><strong>Role:</strong> {currentUser.role}</div>
      </div>
      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>Old Password</label>
        <input name="old_password" type="password" value={form.old_password} onChange={handleChange} required style={inputStyle} />
        <label style={labelStyle}>New Password</label>
        <input name="new_password" type="password" value={form.new_password} onChange={handleChange} required style={inputStyle} />
        <button type="submit" disabled={loading} style={buttonStyle}>{loading ? 'Changing...' : 'Change Password'}</button>
      </form>
      {message && <div style={successStyle}>{message}</div>}
      {error && <div style={errorStyle}>{error}</div>}
    </div>
  );
};

export default ProfilePage; 