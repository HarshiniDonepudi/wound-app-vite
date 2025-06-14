import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllWounds, getReviewQueue, getOmitQueue } from '../services/woundService';

const WoundListPage = () => {
  const [wounds, setWounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [statusFilters, setStatusFilters] = useState({
    annotated: false,
    not_annotated: false,
    expert_review: false,
    omitted: false,
  });
  const [reviewQueue, setReviewQueue] = useState([]);
  const [omitQueue, setOmitQueue] = useState([]);

  useEffect(() => {
    const loadWounds = async () => {
      try {
        setLoading(true);
        const [data, review, omit] = await Promise.all([
          getAllWounds(),
          getReviewQueue(),
          getOmitQueue()
        ]);
        // Map backend properties to frontend-friendly names
        const mappedWounds = data.map(w => ({
          ...w,
          wound_type: w.wound_type || w.WoundType || '',
          body_location: w.body_location || w.WoundLocationLocation || ''
        }));
        setWounds(mappedWounds);
        setReviewQueue(review.map(w => w.id || w.wound_id));
        setOmitQueue(omit.map(w => w.id || w.wound_id));
      } catch (err) {
        console.error('Error loading wounds:', err);
        setError('Failed to load wound list. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    loadWounds();
  }, []);

  const getReviewStatus = (woundId) => {
    if (reviewQueue.includes(woundId)) return 'expert_review';
    if (omitQueue.includes(woundId)) return 'omitted';
    return null;
  };

  // Filter wounds based on search term and status
  const filteredWounds = wounds.filter(wound => {
    const matchesSearch = wound.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          wound.id.toString().includes(searchTerm);
    const reviewStatus = getReviewStatus(wound.id);
    const activeStatuses = Object.entries(statusFilters).filter(([k, v]) => v).map(([k]) => k);
    if (activeStatuses.length > 0) {
      if (
        (activeStatuses.includes('annotated') && wound.annotated && !reviewQueue.includes(wound.id) && !omitQueue.includes(wound.id)) ||
        (activeStatuses.includes('not_annotated') && !wound.annotated) ||
        (activeStatuses.includes('expert_review') && reviewQueue.includes(wound.id)) ||
        (activeStatuses.includes('omitted') && omitQueue.includes(wound.id))
      ) {
        return matchesSearch;
      }
      return false;
    }
    return matchesSearch;
  });

  // Add these icon SVGs for tags
  const ReviewIcon = () => (
    <svg style={{ marginRight: 4, verticalAlign: 'middle' }} width="16" height="16" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
  );
  const OmitIcon = () => (
    <svg style={{ marginRight: 4, verticalAlign: 'middle' }} width="16" height="16" fill="none" stroke="#dc2626" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="8" y1="8" x2="16" y2="16"/><line x1="16" y1="8" x2="8" y2="16"/></svg>
  );

  return (
    <div className="wound-list-container">
      {/* Header with title and actions */}
      <div className="wound-list-header">
        <div className="wound-list-header-top">
          <h1 className="wound-list-title">Wound Images</h1>
          <div className="wound-list-actions">
            <button
              onClick={() => setFilterVisible(!filterVisible)}
              className="wound-list-filter-btn"
            >
              <svg className="wound-list-filter-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" 
                />
              </svg>
              Filters
            </button>
          </div>
        </div>
        <p className="wound-list-subtitle">
          Browse and select wound images for annotation
        </p>
      </div>
      
      {/* Search and filters */}
      <div className={`wound-list-filters ${filterVisible ? 'wound-list-filters--visible' : ''}`}>
        <div className="wound-list-filters-inner">
          {/* Search filter */}
          <div className="wound-list-search-group">
            <label htmlFor="search" className="wound-list-search-label">
              Search Wounds
            </label>
            <div className="wound-list-search-wrapper">
              <div className="wound-list-search-icon-wrapper">
                <svg className="wound-list-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                  />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by ID or path..."
                className="wound-list-search-input"
              />
              {searchTerm && (
                <div className="wound-list-clear-btn-wrapper">
                  <button
                    onClick={() => setSearchTerm('')}
                    className="wound-list-clear-btn"
                  >
                    <svg className="wound-list-clear-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M6 18L18 6M6 6l12 12" 
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Annotation status filter */}
          <div className="wound-list-filter-group">
            <label className="wound-list-filter-label">Status</label>
            <div className="wound-list-filter-options">
              {['annotated', 'not_annotated', 'expert_review', 'omitted'].map((status) => (
                <div className="wound-list-filter-option" key={status}>
                  <input
                    type="checkbox"
                    id={`status-${status}`}
                    checked={statusFilters[status]}
                    onChange={() => setStatusFilters(f => ({ ...f, [status]: !f[status] }))}
                    className="wound-list-filter-checkbox"
                  />
                  <label htmlFor={`status-${status}`} className="wound-list-filter-checkbox-label">
                    {status === 'annotated' && 'Annotated'}
                    {status === 'not_annotated' && 'Not Annotated'}
                    {status === 'expert_review' && 'Expert Review'}
                    {status === 'omitted' && 'Omitted'}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="wound-list-loading">
          <div className="wound-list-loading-inner">
            <div className="wound-list-spinner"></div>
            <h3 className="wound-list-loading-title">Loading wound images</h3>
            <p className="wound-list-loading-text">Please wait while we fetch the data...</p>
          </div>
        </div>
      )}
      
      {/* Error state */}
      {error && !loading && (
        <div className="wound-list-error">
          <div className="wound-list-error-inner">
            <div className="wound-list-error-icon">
              <svg className="wound-list-error-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
            <h3 className="wound-list-error-title">Error Loading Data</h3>
            <p className="wound-list-error-text">{error}</p>
          </div>
          <div className="wound-list-error-actions">
            <button
              onClick={() => window.location.reload()}
              className="wound-list-retry-btn"
            >
              <svg className="wound-list-retry-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
              Retry
            </button>
          </div>
        </div>
      )}
      
      {/* Empty state */}
      {!loading && !error && filteredWounds.length === 0 && (
        <div className="wound-list-empty">
          <div className="wound-list-empty-icon">
            <svg className="wound-list-empty-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
          </div>
          <h3 className="wound-list-empty-title">No wound images found</h3>
          <p className="wound-list-empty-text">
            {searchTerm || Object.entries(statusFilters).filter(([k, v]) => v).length > 0
              ? "Try adjusting your search or filters to find what you're looking for."
              : "Get started by uploading new wound images."}
          </p>
        </div>
      )}
      
      {/* Wounds grid */}
      {!loading && !error && filteredWounds.length > 0 && (
        <div className="wound-list-grid-container">
          <div className="wound-list-grid" style={{ overflowX: 'auto', maxWidth: '100%' }}>
            <table className="wound-list-table" style={{ tableLayout: 'auto', width: '100%', minWidth: 0 }}>
              <thead className="wound-list-table__head">
                <tr>
                  <th className="wound-list-table__th" style={{ whiteSpace: 'nowrap' }}>Wound ID</th>
                  <th className="wound-list-table__th" style={{ whiteSpace: 'nowrap' }}>Path</th>
                  <th className="wound-list-table__th" style={{ whiteSpace: 'nowrap' }}>Status</th>
                  <th className="wound-list-table__th" style={{ whiteSpace: 'nowrap' }}>Annotator(s)</th>
                  <th className="wound-list-table__th wound-list-table__th--actions" style={{ whiteSpace: 'nowrap' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="wound-list-table__body">
                {filteredWounds.map((wound) => (
                  <tr
                    key={wound.id}
                    className={`wound-list-table__tr ${!getReviewStatus(wound.id) && wound.annotated ? 'wound-list-table__tr--annotated' : ''}`}
                  >
                    <td className="wound-list-table__td">
                      <div className="wound-list-table__cell-text">{wound.id}
                        {reviewQueue.includes(wound.id) && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', marginLeft: 8, padding: '2px 10px', borderRadius: 999, background: '#e0e7ff', color: '#2563eb', fontWeight: 600, fontSize: '0.92em', boxShadow: '0 1px 4px rgba(37,99,235,0.07)', letterSpacing: 0.1, gap: 4
                          }}>
                            <ReviewIcon /> Expert Review
                          </span>
                        )}
                        {omitQueue.includes(wound.id) && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', marginLeft: 8, padding: '2px 10px', borderRadius: 999, background: '#fee2e2', color: '#dc2626', fontWeight: 600, fontSize: '0.92em', boxShadow: '0 1px 4px rgba(220,38,38,0.07)', letterSpacing: 0.1, gap: 4
                          }}>
                            <OmitIcon /> Omitted
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="wound-list-table__td">
                      <div className="wound-list-table__cell-text">{wound.path}</div>
                    </td>
                    <td className="wound-list-table__td">
                      {/* Only show annotation status here */}
                      {!getReviewStatus(wound.id) && wound.annotated && (
                        <span className="wound-list-status wound-list-status--annotated">✔ Annotated</span>
                      )}
                      {!wound.annotated && (
                        <span className="wound-list-status wound-list-status--unannotated">✗ Not Annotated</span>
                      )}
                    </td>
                    <td className="wound-list-table__td">
                      <div className="wound-list-table__cell-text">{wound.annotators || '-'}</div>
                    </td>
                    <td className="wound-list-table__td wound-list-table__td--actions">
                      <Link to={`/annotate/${wound.id}`} className="wound-list-annotate-link">
                        {/* Only allow editing if not omitted */}
                        {getReviewStatus(wound.id) === 'omitted' ? 'View' : (wound.annotated ? 'Edit Annotations' : 'Annotate')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="wound-list-pagination">
            <div className="wound-list-pagination__mobile">
              <button className="wound-list-pagination__btn">Previous</button>
              <button className="wound-list-pagination__btn">Next</button>
            </div>
            <div className="wound-list-pagination__desktop">
              <p className="wound-list-pagination__text">
                Showing <span className="wound-list-pagination__bold">1</span> to <span className="wound-list-pagination__bold">{filteredWounds.length}</span> of <span className="wound-list-pagination__bold">{filteredWounds.length}</span> results
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WoundListPage;