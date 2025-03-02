import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllWounds } from '../services/woundService';

const WoundListPage = () => {
  const [wounds, setWounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [showAnnotatedOnly, setShowAnnotatedOnly] = useState(false);
  const [showUnannotatedOnly, setShowUnannotatedOnly] = useState(false);

  useEffect(() => {
    const loadWounds = async () => {
      try {
        setLoading(true);
        console.log("Fetching wounds with annotation status...");
        const data = await getAllWounds();
        console.log("Received wound data:", data);
        setWounds(data);
      } catch (err) {
        console.error('Error loading wounds:', err);
        setError('Failed to load wound list. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadWounds();
  }, []);

  // Filter wounds based on search term and annotation status
  const filteredWounds = wounds.filter(wound => {
    // Filter by search term
    const matchesSearch = wound.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          wound.id.toString().includes(searchTerm);
    
    // Filter by annotation status
    if (showAnnotatedOnly && !wound.annotated) return false;
    if (showUnannotatedOnly && wound.annotated) return false;
    
    return matchesSearch;
  });

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
            <label className="wound-list-filter-label">Annotation Status</label>
            <div className="wound-list-filter-options">
              <div className="wound-list-filter-option">
                <input
                  type="checkbox"
                  id="annotated"
                  checked={showAnnotatedOnly}
                  onChange={() => {
                    setShowAnnotatedOnly(!showAnnotatedOnly);
                    if (!showAnnotatedOnly) setShowUnannotatedOnly(false);
                  }}
                  className="wound-list-filter-checkbox"
                />
                <label htmlFor="annotated" className="wound-list-filter-checkbox-label">
                  Show annotated only
                </label>
              </div>
              <div className="wound-list-filter-option">
                <input
                  type="checkbox"
                  id="unannotated"
                  checked={showUnannotatedOnly}
                  onChange={() => {
                    setShowUnannotatedOnly(!showUnannotatedOnly);
                    if (!showUnannotatedOnly) setShowAnnotatedOnly(false);
                  }}
                  className="wound-list-filter-checkbox"
                />
                <label htmlFor="unannotated" className="wound-list-filter-checkbox-label">
                  Show unannotated only
                </label>
              </div>
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
            {searchTerm || showAnnotatedOnly || showUnannotatedOnly
              ? "Try adjusting your search or filters to find what you're looking for."
              : "Get started by uploading new wound images."}
          </p>
        </div>
      )}
      
      {/* Wounds grid */}
      {!loading && !error && filteredWounds.length > 0 && (
        <div className="wound-list-grid-container">
          <div className="wound-list-grid">
            <table className="wound-list-table">
              <thead className="wound-list-table__head">
                <tr>
                  <th className="wound-list-table__th">Wound ID</th>
                  <th className="wound-list-table__th">Path</th>
                  <th className="wound-list-table__th">Status</th>
                  <th className="wound-list-table__th wound-list-table__th--actions">Actions</th>
                </tr>
              </thead>
              <tbody className="wound-list-table__body">
                {filteredWounds.map((wound) => (
                  <tr
                    key={wound.id}
                    className={`wound-list-table__tr ${wound.annotated ? 'wound-list-table__tr--annotated' : ''}`}
                  >
                    <td className="wound-list-table__td">
                      <div className="wound-list-table__cell-text">{wound.id}</div>
                    </td>
                    <td className="wound-list-table__td">
                      <div className="wound-list-table__cell-text">{wound.path}</div>
                    </td>
                    <td className="wound-list-table__td">
                      {wound.annotated ? (
                        <span className="wound-list-status wound-list-status--annotated">
                          <svg className="wound-list-status-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Annotated
                        </span>
                      ) : (
                        <span className="wound-list-status wound-list-status--unannotated">
                          <svg className="wound-list-status-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 12H6" />
                          </svg>
                          Not Annotated
                        </span>
                      )}
                    </td>
                    <td className="wound-list-table__td wound-list-table__td--actions">
                      <Link to={`/annotate/${wound.id}`} className="wound-list-annotate-link">
                        {wound.annotated ? 'Edit Annotations' : 'Annotate'}
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