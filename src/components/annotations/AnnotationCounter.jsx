import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';

// Styled components for the counter dialog
const CounterDialog = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  width: 300px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 16px;
  z-index: 1000;
`;

const DialogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
`;

const DialogTitle = styled.h2`
  margin: 0;
  font-size: 1.1rem;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #666;
  &:hover {
    color: #000;
  }
`;

const CountList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const CountItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const CategoryName = styled.span`
  font-weight: 500;
`;

const CountNumber = styled.span`
  font-weight: 700;
  color: #2563eb;
`;

const TotalCountItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-top: 2px solid #e5e7eb;
  margin-top: 8px;
  font-weight: bold;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 20px 0;
  color: #666;
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 20px 0;
  color: #e53e3e;
`;

const RetryButton = styled.button`
  margin-top: 10px;
  padding: 6px 12px;
  background-color: #e5e7eb;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  
  &:hover {
    background-color: #d1d5db;
  }
`;

/**
 * AnnotationCounter Component
 * 
 * A floating dialog that shows the total count of annotations by category.
 */
const AnnotationCounter = ({ onClose }) => {
  const [categoryCounts, setCategoryCounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCounts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Add auth token to the request header
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      // Get the API endpoint for annotation counts
      const response = await axios.get('/api/annotations/count-by-category', config);
      console.log('Annotation counts response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        // Process the data to ensure it's in the right format
        const counts = response.data.map(item => ({
          category: item.category || "Uncategorized",
          count: item.count || 0
        }));
        
        setCategoryCounts(counts);
      } else {
        // Handle unexpected response format
        console.error('Unexpected response format:', response.data);
        setError('Received unexpected data format from server');
      }
    } catch (err) {
      console.error('Error fetching annotation counts:', err);
      setError(`Failed to load annotation counts: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  // Calculate total count across all categories
  const totalCount = categoryCounts.reduce((sum, item) => sum + item.count, 0);

  return (
    <CounterDialog>
      <DialogHeader>
        <DialogTitle>Annotation Counter</DialogTitle>
        <CloseButton onClick={onClose}>×</CloseButton>
      </DialogHeader>
      
      {loading && <LoadingState>Loading counts...</LoadingState>}
      
      {error && (
        <ErrorState>
          {error}
          <div>
            <RetryButton onClick={fetchCounts}>Retry</RetryButton>
          </div>
        </ErrorState>
      )}
      
      {!loading && !error && (
        <CountList>
          {categoryCounts.length === 0 ? (
            <LoadingState>No annotations found.</LoadingState>
          ) : (
            <>
              {categoryCounts.map((item, index) => (
                <CountItem key={index}>
                  <CategoryName>{item.category}</CategoryName>
                  <CountNumber>{item.count}</CountNumber>
                </CountItem>
              ))}
              <TotalCountItem>
                <span>Total Annotations</span>
                <span>{totalCount}</span>
              </TotalCountItem>
            </>
          )}
        </CountList>
      )}
    </CounterDialog>
  );
};

export default AnnotationCounter;