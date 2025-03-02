import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAnnotations } from '../hooks/useAnnotations';
import { getAllWounds } from '../services/woundService';

// Import your annotation components
import AnnotationCanvas from '../components/annotations/AnnotationCanvas';
import AnnotationControls from '../components/annotations/AnnotationControls';
import AnnotationInfo from '../components/annotations/AnnotationInfo';
import AnnotationCounter from '../components/annotations/AnnotationCounter';

export default function AnnotationPage() {
  const { woundId } = useParams();
  const { wound, loading, error, selectedAnnotation, annotations } = useAnnotations();
  const [showInfo, setShowInfo] = useState(true);
  const [showCounter, setShowCounter] = useState(false);
  const [allWounds, setAllWounds] = useState([]);
  const [currentWoundIndex, setCurrentWoundIndex] = useState(-1);
  const navigate = useNavigate();

  // Load all wounds for previous/next navigation
  useEffect(() => {
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
            <AnnotationControls />
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