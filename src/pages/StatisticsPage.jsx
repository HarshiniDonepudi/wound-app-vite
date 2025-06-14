import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Bar, Line } from 'react-chartjs-2';
import 'chart.js/auto';

const StatisticsPage = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/admin/annotation-stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setStats(data);
        else setError(data.error || 'Failed to fetch stats');
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (!currentUser || currentUser.role !== 'admin') {
    return <div>Access denied. Admins only.</div>;
  }

  if (loading) return <div style={{padding:'2em'}}>Loading statistics...</div>;
  if (error) return <div style={{padding:'2em',color:'#c53030'}}>{error}</div>;
  if (!stats) return null;

  // Prepare data for charts
  const users = stats.users || [];
  const annotationCounts = users.map(u => u.annotation_count);
  const annotationRates = users.map(u => u.annotation_rate_per_day);
  const labels = users.map(u => u.full_name || u.username);

  return (
    <div style={{padding:'2em',maxWidth:'900px',margin:'0 auto'}}>
      <h2 style={{fontSize:'2em',fontWeight:700,marginBottom:'1em'}}>Annotation Statistics</h2>
      <div style={{marginBottom:'2em'}}>
        <h3 style={{fontSize:'1.2em',fontWeight:600,marginBottom:'0.5em'}}>Annotations by User</h3>
        <Bar
          data={{
            labels,
            datasets: [{
              label: 'Total Annotations',
              data: annotationCounts,
              backgroundColor: '#3182ce',
            }]
          }}
          options={{
            responsive: true,
            plugins: { legend: { display: false } }
          }}
        />
      </div>
      <div>
        <h3 style={{fontSize:'1.2em',fontWeight:600,marginBottom:'0.5em'}}>Annotation Rate (per day)</h3>
        <Line
          data={{
            labels,
            datasets: [{
              label: 'Annotations per Day',
              data: annotationRates,
              borderColor: '#38a169',
              backgroundColor: 'rgba(56,161,105,0.2)',
              tension: 0.3,
            }]
          }}
          options={{
            responsive: true,
            plugins: { legend: { display: false } }
          }}
        />
      </div>
      <div style={{marginTop:'2em'}}>
        <h3 style={{fontSize:'1.2em',fontWeight:600,marginBottom:'0.5em'}}>Raw Data</h3>
        <table style={{width:'100%',borderCollapse:'collapse',background:'#fff',borderRadius:'8px',boxShadow:'0 2px 8px rgba(0,0,0,0.07)'}}>
          <thead>
            <tr>
              <th style={{padding:'0.5em',borderBottom:'1px solid #e2e8f0'}}>User</th>
              <th style={{padding:'0.5em',borderBottom:'1px solid #e2e8f0'}}>Role</th>
              <th style={{padding:'0.5em',borderBottom:'1px solid #e2e8f0'}}>Total Annotations</th>
              <th style={{padding:'0.5em',borderBottom:'1px solid #e2e8f0'}}>Annotations/Day</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.user_id}>
                <td style={{padding:'0.5em',borderBottom:'1px solid #e2e8f0'}}>{u.full_name || u.username}</td>
                <td style={{padding:'0.5em',borderBottom:'1px solid #e2e8f0'}}>{u.role}</td>
                <td style={{padding:'0.5em',borderBottom:'1px solid #e2e8f0'}}>{u.annotation_count}</td>
                <td style={{padding:'0.5em',borderBottom:'1px solid #e2e8f0'}}>{u.annotation_rate_per_day}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StatisticsPage; 