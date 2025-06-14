import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getOmitQueue } from '../services/woundService';

const OmittedWoundsPage = () => {
  const [wounds, setWounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const wounds = await getOmitQueue();
      setWounds(wounds);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-card" style={{ maxWidth: 900, margin: '32px auto', padding: 32, background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            marginBottom: 24,
            background: 'none',
            color: '#dc2626',
            border: '1px solid #e5e7eb',
            borderRadius: 6,
            padding: '8px 18px',
            fontWeight: 500,
            cursor: 'pointer',
            fontSize: '0.98em',
            boxShadow: 'none',
            display: 'inline-block',
            textDecoration: 'none',
            transition: 'background 0.2s, color 0.2s',
          }}
          onMouseOver={e => { e.currentTarget.style.background = '#f3f4f6'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'none'; }}
        >
          ← Back
        </button>
        <h1 className="dashboard-section-title" style={{ marginBottom: 24 }}>Omitted Wounds</h1>
        {loading ? (
          <p>Loading...</p>
        ) : wounds.length === 0 ? (
          <p>No wounds are currently omitted.</p>
        ) : (
          <div className="wound-list-grid">
            <table className="wound-list-table">
              <thead className="wound-list-table__head">
                <tr>
                  <th className="wound-list-table__th">Wound ID</th>
                  <th className="wound-list-table__th">Path</th>
                  <th className="wound-list-table__th">Requested By</th>
                  <th className="wound-list-table__th">Requested At</th>
                  <th className="wound-list-table__th wound-list-table__th--actions">Actions</th>
                </tr>
              </thead>
              <tbody className="wound-list-table__body">
                {wounds.map((wound) => (
                  <tr key={wound.id || wound.wound_id}>
                    <td className="wound-list-table__td">{wound.id || wound.wound_id}</td>
                    <td className="wound-list-table__td">{wound.path}</td>
                    <td className="wound-list-table__td">{wound.requested_by || '-'}</td>
                    <td className="wound-list-table__td">{wound.requested_at ? new Date(wound.requested_at).toLocaleString() : '-'}</td>
                    <td className="wound-list-table__td wound-list-table__td--actions">
                      <Link to={`/annotate/${wound.id || wound.wound_id}`} className="wound-list-annotate-link">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default OmittedWoundsPage; 