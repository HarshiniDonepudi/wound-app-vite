import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAnnotations } from '../hooks/useAnnotations';
import { getAllWounds, getICD10Info, getPhysicianOrder } from '../services/woundService';

// Import your annotation components
import AnnotationCanvas from '../components/annotations/AnnotationCanvas';
import AnnotationControls from '../components/annotations/AnnotationControls';
import AnnotationInfo from '../components/annotations/AnnotationInfo';
import AnnotationCounter from '../components/annotations/AnnotationCounter';

export default function AnnotationPage() {
  const { woundId } = useParams();
  const { wound, loading, error, selectedAnnotation, annotations, spatialFields } = useAnnotations();
  const [showInfo, setShowInfo] = useState(true);
  const [showCounter, setShowCounter] = useState(false);
  const [allWounds, setAllWounds] = useState([]);
  const [currentWoundIndex, setCurrentWoundIndex] = useState(-1);
  const navigate = useNavigate();
  const [showSpatialFields, setShowSpatialFields] = useState(false);
  const [showICD10, setShowICD10] = useState(false);
  const [showPhysicianOrder, setShowPhysicianOrder] = useState(false);
  const [icd10Info, setICD10Info] = useState(null);
  const [physicianOrder, setPhysicianOrder] = useState(null);
  const [icd10Loading, setICD10Loading] = useState(false);
  const [physicianOrderLoading, setPhysicianOrderLoading] = useState(false);
  const [icd10Error, setICD10Error] = useState(null);
  const [physicianOrderError, setPhysicianOrderError] = useState(null);

  // Load all wounds for previous/next navigation
  const loadAllWounds = async () => {
    try {
      const wounds = await getAllWounds();
      setAllWounds(wounds);
      // Find the index of the current wound
      const index = wounds.findIndex(w => w.id.toString() === woundId.toString());
      setCurrentWoundIndex(index);
    } catch (err) {
      console.error("Error loading all wounds:", err);
    }
  };

  useEffect(() => {
    loadAllWounds();
  }, [woundId]);

  // Navigation handlers
  const goToPreviousWound = () => {
    if (currentWoundIndex > 0) {
      const previousWound = allWounds[currentWoundIndex - 1];
      navigate(`/annotate/${previousWound.id}`);
    }
  };

  const goToNextWound = () => {
    if (currentWoundIndex < allWounds.length - 1) {
      const nextWound = allWounds[currentWoundIndex + 1];
      navigate(`/annotate/${nextWound.id}`);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="annotation-page-loading">
        <div className="annotation-page-loading__inner">
          <div className="spinner-border"></div>
          <h3>Loading wound data</h3>
          <p>Please wait while we load your image...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="annotation-page-error">
        <div className="annotation-page-error__card">
          <div className="error-icon">
            <svg className="error-icon__svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 
                   2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0
                   L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2>Error Loading Data</h2>
          <p>{error}</p>
          <div className="error-card__actions">
            <Link to="/wounds" className="btn">
              <svg className="btn__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to wound list
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Main Layout
  return (
    <div className="annotation-page-container">
      {/* Header */}
      <header className="annotation-header">
        <div className="annotation-header__left">
          <h1 className="page-title">Annotate Wound</h1>
          <div className="page-badges">
            <span className="badge badge--blue">ID: {woundId}</span>
            {wound?.patient_id && (
              <span className="badge badge--green">
                Patient ID: {wound.patient_id}
              </span>
            )}
            {annotations && annotations.length > 0 && (
              <span className="badge badge--amber">
                {annotations.length} Annotations
              </span>
            )}
          </div>
          {wound && (
            <p className="header-subtitle">
              {wound.wound_type} - {wound.body_location}
            </p>
          )}
          {/* Spatial Fields Toggle Button and Card */}
          {spatialFields && (
            <div style={{marginTop: '1em'}}>
              <button
                onClick={() => setShowSpatialFields(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5em',
                  background: '#3182ce', color: '#fff', border: 'none', borderRadius: '6px',
                  padding: '0.5em 1.2em', fontWeight: 600, fontSize: '1em', cursor: 'pointer',
                  boxShadow: '0 1px 4px rgba(49,130,206,0.08)',
                  marginBottom: showSpatialFields ? '1em' : 0
                }}
              >
                <span style={{fontSize: '1.2em'}}>🧭</span>
                {showSpatialFields ? 'Hide Spatial Fields' : 'Show Spatial Fields'}
              </button>
              {showSpatialFields && (
                <div style={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '1.5em',
                  marginTop: '1em',
                  maxWidth: 420,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  fontSize: '1em',
                }}>
                  <div style={{display: 'flex', alignItems: 'center', marginBottom: '1em'}}>
                    <span style={{fontSize: '1.5em', marginRight: '0.5em', color: '#3182ce'}}>🧭</span>
                    <h4 style={{margin: 0, color: '#2d3748', fontWeight: 700, fontSize: '1.15em'}}>Wound Spatial Fields</h4>
                  </div>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5em 1em'}}>
                    {Object.entries(spatialFields).map(([key, value]) => (
                      <React.Fragment key={key}>
                        <div style={{fontWeight: 500, color: '#4a5568', textTransform: 'capitalize'}}>
                          {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                        <div style={{color: '#2d3748'}}>{value ?? '-'}</div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {/* ICD-10 Info Toggle Button and Card */}
          <div style={{marginTop: '1em'}}>
            <button
              onClick={async () => {
                setShowICD10(v => {
                  if (!icd10Info && !icd10Loading && !icd10Error && !v) {
                    setICD10Loading(true);
                    setICD10Error(null);
                    getICD10Info(woundId)
                      .then(data => setICD10Info(data))
                      .catch(e => setICD10Error(e.message || 'Failed to load ICD-10 info'))
                      .finally(() => setICD10Loading(false));
                  }
                  return !v;
                });
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5em',
                background: '#805ad5', color: '#fff', border: 'none', borderRadius: '6px',
                padding: '0.5em 1.2em', fontWeight: 600, fontSize: '1em', cursor: 'pointer',
                boxShadow: '0 1px 4px rgba(128,90,213,0.08)',
                marginBottom: showICD10 ? '1em' : 0
              }}
            >
              <span style={{fontSize: '1.2em'}}>🩺</span>
              {showICD10 ? 'Hide ICD-10 Info' : 'Show ICD-10 Info'}
            </button>
            {showICD10 && (
              <div style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '1.5em',
                marginTop: '1em',
                maxWidth: 420,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                fontSize: '1em',
              }}>
                <div style={{display: 'flex', alignItems: 'center', marginBottom: '1em'}}>
                  <span style={{fontSize: '1.5em', marginRight: '0.5em', color: '#805ad5'}}>🩺</span>
                  <h4 style={{margin: 0, color: '#2d3748', fontWeight: 700, fontSize: '1.15em'}}>ICD-10 Information</h4>
                </div>
                {icd10Loading ? <div>Loading...</div> : icd10Error ? <div style={{color:'#c53030'}}>{icd10Error}</div> : (
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5em 1em'}}>
                    <div style={{fontWeight: 500, color: '#4a5568'}}>ICD-10 Code</div>
                    <div style={{color: '#2d3748'}}>{icd10Info?.ICD10Code ?? '-'}</div>
                    <div style={{fontWeight: 500, color: '#4a5568'}}>Description</div>
                    <div style={{color: '#2d3748'}}>{icd10Info?.ICDShortDescription ?? '-'}</div>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Physician Order Toggle Button and Card */}
          <div style={{marginTop: '1em'}}>
            <button
              onClick={async () => {
                setShowPhysicianOrder(v => {
                  if (!physicianOrder && !physicianOrderLoading && !physicianOrderError && !v) {
                    setPhysicianOrderLoading(true);
                    setPhysicianOrderError(null);
                    getPhysicianOrder(woundId)
                      .then(data => setPhysicianOrder(data))
                      .catch(e => setPhysicianOrderError(e.message || 'Failed to load physician order'))
                      .finally(() => setPhysicianOrderLoading(false));
                  }
                  return !v;
                });
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5em',
                background: '#38a169', color: '#fff', border: 'none', borderRadius: '6px',
                padding: '0.5em 1.2em', fontWeight: 600, fontSize: '1em', cursor: 'pointer',
                boxShadow: '0 1px 4px rgba(56,161,105,0.08)',
                marginBottom: showPhysicianOrder ? '1em' : 0
              }}
            >
              <span style={{fontSize: '1.2em'}}>📄</span>
              {showPhysicianOrder ? 'Hide Physician Order' : 'Show Physician Order'}
            </button>
            {showPhysicianOrder && (
              <div style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '1.5em',
                marginTop: '1em',
                maxWidth: 420,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                fontSize: '1em',
              }}>
                <div style={{display: 'flex', alignItems: 'center', marginBottom: '1em'}}>
                  <span style={{fontSize: '1.5em', marginRight: '0.5em', color: '#38a169'}}>📄</span>
                  <h4 style={{margin: 0, color: '#2d3748', fontWeight: 700, fontSize: '1.15em'}}>Physician Order</h4>
                </div>
                {physicianOrderLoading ? <div>Loading...</div> : physicianOrderError ? <div style={{color:'#c53030'}}>{physicianOrderError}</div> : (
                  <div style={{color: '#2d3748'}}>{physicianOrder?.PhysicianOrderDescription ?? '-'}</div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="annotation-header__right">
          {/* Navigation buttons */}
          <div className="annotation-nav-buttons">
            <button
              onClick={goToPreviousWound}
              disabled={currentWoundIndex <= 0}
              className="btn btn--outline"
              title="Previous wound"
            >
              <svg className="btn__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M15 19l-7-7 7-7" 
                />
              </svg>
              Previous
            </button>
            <span className="annotation-nav-counter">
              {currentWoundIndex + 1} of {allWounds.length}
            </span>
            <button
              onClick={goToNextWound}
              disabled={currentWoundIndex >= allWounds.length - 1}
              className="btn btn--outline"
              title="Next wound"
            >
              Next
              <svg className="btn__icon btn__icon--right" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M9 5l7 7-7 7" 
                />
              </svg>
            </button>
          </div>
          
          {/* Stats Button */}
          <button
            onClick={() => setShowCounter(!showCounter)}
            className="btn btn--outline"
            title="Show annotation statistics"
          >
            <svg 
              className="btn__icon" 
              width="20" 
              height="20" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
              />
            </svg>
            {showCounter ? 'Hide Stats' : 'Show Stats'}
          </button>
          
          {selectedAnnotation && (
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="btn btn--outline"
            >
              {showInfo ? 'Hide Details' : 'Show Details'}
            </button>
          )}
          <Link to="/wounds" className="btn btn--outline">
            <svg className="btn__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M10 19l-7-7m0 0l7-7m-7 7h18" 
              />
            </svg>
            Back
          </Link>
        </div>
      </header>

      {/* Conditional render of the counter dialog */}
      {showCounter && (
        <AnnotationCounter onClose={() => setShowCounter(false)} />
      )}

      {/* Main Content: Canvas + Sidebar */}
      <div className="annotation-content">
        {/* Canvas Section */}
        <div className="annotation-canvas-area">
          <div className="annotation-canvas-card">
            <div className="annotation-canvas-card__header">
              <h2>Wound Image</h2>
              <span className="annotation-hint">Draw on image to annotate</span>
            </div>
            <div className="annotation-canvas-card__body">
              <AnnotationCanvas />
            </div>
          </div>

          {/* Mobile Annotation Info */}
          {selectedAnnotation && showInfo && (
            <div className="annotation-info-card mobile-only">
              <AnnotationInfo />
            </div>
          )}
        </div>

        {/* Sidebar (Controls + Info) */}
        <div className="annotation-sidebar">
          <div className="annotation-sidebar__section">
            <AnnotationControls onSaveSuccess={loadAllWounds} />
          </div>

          {selectedAnnotation && showInfo && (
            <div className="annotation-sidebar__section desktop-only">
              <AnnotationInfo />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}