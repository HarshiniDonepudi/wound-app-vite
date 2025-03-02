import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAnnotations } from '../hooks/useAnnotations';

// Import your annotation components
import AnnotationCanvas from '../components/annotations/AnnotationCanvas';
import AnnotationControls from '../components/annotations/AnnotationControls';
import AnnotationInfo from '../components/annotations/AnnotationInfo';

export default function AnnotationPage() {
  const { woundId } = useParams();
  const { wound, loading, error, selectedAnnotation } = useAnnotations();
  const [showInfo, setShowInfo] = useState(true);

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
          </div>
          {wound && (
            <p className="header-subtitle">
              {wound.wound_type} - {wound.body_location}
            </p>
          )}
        </div>
        <div className="annotation-header__right">
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


