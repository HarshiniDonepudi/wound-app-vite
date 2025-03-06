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
 * A robust parser that can handle many different API response formats
 * for annotation counts
 */
const parseAnnotationCounts = (data) => {
    try {
      // If data is a string, check if it looks like HTML
      if (typeof data === 'string') {
        if (data.trim().startsWith('<')) {
          console.error("Received HTML response instead of JSON:", data);
          return [];
        }
        try {
          data = JSON.parse(data);
        } catch (e) {
          console.log('Failed to parse string as JSON:', e);
          return [];
        }
      }
      
      // Handle null or undefined
      if (data === null || data === undefined) {
        console.log('Data is null or undefined');
        return [];
      }
      
      // Handle array format
      if (Array.isArray(data)) {
        return data.map(item => {
          if (typeof item !== 'object' || item === null) {
            return { category: "Unknown", count: 0 };
          }
          return {
            category: item.category || "Uncategorized",
            count: Number(item.count) || 0
          };
        });
      } 
      // Handle object format (key-value pairs)
      else if (typeof data === 'object') {
        if (data.data && Array.isArray(data.data)) {
          return parseAnnotationCounts(data.data);
        }
        return Object.entries(data).map(([key, value]) => ({
          category: key,
          count: Number(value) || 0
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error parsing annotation counts:', error);
      return [];
    }
  };
  

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
      
      console.log('Fetching annotation counts...');
      
      // Mock data for testing - uncomment for development testing
      /*
      setTimeout(() => {
        const mockData = [
          { category: "PRESSURE / DEVICE RELATED PRESSURE", count: 12 },
          { category: "SURGICAL", count: 8 },
          { category: "TRAUMA", count: 5 },
          { category: "DIABETIC SKIN ULCER (FOOT)", count: 3 }
        ];
        setCategoryCounts(mockData);
        setLoading(false);
      }, 1000);
      return;
      */
      
      // Get the API endpoint for annotation counts
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/annotations/count-by-category`, config);

      
      console.log('Raw API response:', response);
      console.log('Response data type:', typeof response.data);
      
      if (Array.isArray(response.data)) {
        console.log('Response is an array with length:', response.data.length);
      } else if (typeof response.data === 'object') {
        console.log('Response is an object with keys:', Object.keys(response.data));
      }
      
      // Use our robust parser to handle any response format
      const parsedCounts = parseAnnotationCounts(response.data);
      console.log('Parsed annotation counts:', parsedCounts);
      
      if (parsedCounts.length === 0) {
        console.log('No annotation counts found or parsing failed');
      }
      
      setCategoryCounts(parsedCounts);
      
    } catch (err) {
      console.error('Error fetching annotation counts:', err);
      
      // Detailed error information
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        setError(`Server error: ${err.response.status}. ${err.response.data?.error || ''}`);
      } else if (err.request) {
        // The request was made but no response was received
        console.error('No response received from server');
        setError('No response received from server. Please check your network connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(`Request error: ${err.message}`);
      }
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