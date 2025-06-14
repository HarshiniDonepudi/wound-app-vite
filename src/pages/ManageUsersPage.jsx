import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const cardStyle = {
  background: '#fff',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
  padding: '2em',
  marginBottom: '2em',
  maxWidth: '600px',
  marginLeft: 'auto',
  marginRight: 'auto',
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
const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '1em',
  background: '#fff',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
};
const thStyle = {
  background: '#f7fafc',
  color: '#2d3748',
  fontWeight: 600,
  padding: '0.75em',
  borderBottom: '1px solid #e2e8f0',
};
const tdStyle = {
  padding: '0.75em',
  borderBottom: '1px solid #e2e8f0',
  color: '#4a5568',
};
const removeBtnStyle = {
  ...buttonStyle,
  background: '#e53e3e',
  marginTop: 0,
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

const ManageUsersPage = () => {
  const { currentUser } = useAuth();
  const [form, setForm] = useState({ full_name: '', username: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch users on mount
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setUsers(data.users || []);
    };
    fetchUsers();
  }, []);

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
        // Refresh user list
        const res2 = await fetch('/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data2 = await res2.json();
        if (res2.ok) setUsers(data2.users || []);
      } else {
        setError(data.error || 'Failed to add annotator');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user_id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/admin/users/${user_id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) setUsers(users.filter(u => u.user_id !== user_id));
    // Optionally show a message
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return <div>Access denied. Admins only.</div>;
  }

  return (
    <div className="manage-users-container" style={{padding:'2em 0',background:'#f7fafc',minHeight:'100vh'}}>
      <div className="email-warning" style={{background:'#fff3cd',color:'#856404',padding:'1em',marginBottom:'1em',border:'1px solid #ffeeba',borderRadius:'4px',maxWidth:'600px',margin:'0 auto 2em auto'}}>
        <strong>Note:</strong> Email sending is via Gmail SMTP. If you want to use a different provider, update the backend email utility.
      </div>
      <div style={cardStyle}>
        <div style={sectionTitle}>Add Annotator</div>
        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Full Name</label>
          <input name="full_name" value={form.full_name} onChange={handleChange} required style={inputStyle} />
          <label style={labelStyle}>Username</label>
          <input name="username" value={form.username} onChange={handleChange} required style={inputStyle} />
          <label style={labelStyle}>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required style={inputStyle} />
          <button type="submit" disabled={loading} style={buttonStyle}>{loading ? 'Adding...' : 'Add Annotator'}</button>
        </form>
        {message && <div style={successStyle}>{message}</div>}
        {error && <div style={errorStyle}>{error}</div>}
      </div>
      <div style={cardStyle}>
        <div style={sectionTitle}>All Users</div>
        <div style={{overflowX:'auto'}}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Full Name</th>
                <th style={thStyle}>Username</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.user_id}>
                  <td style={tdStyle}>{u.full_name}</td>
                  <td style={tdStyle}>{u.username}</td>
                  <td style={tdStyle}>{u.email}</td>
                  <td style={tdStyle}>{u.role}</td>
                  <td style={tdStyle}>
                    {u.role !== 'admin' && (
                      <button style={removeBtnStyle} onClick={() => handleDelete(u.user_id)}>Remove</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUsersPage; 