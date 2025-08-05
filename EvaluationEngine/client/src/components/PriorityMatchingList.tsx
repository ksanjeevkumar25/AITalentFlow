import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface PriorityMatching {
  MatchingListID: number;
  ServiceOrderID: number;
  EmployeeID: number;
  MatchingIndexScore: number;
  Remarks: string;
  Priority: number;
  AssociateWilling: boolean;
  // ServiceOrder fields
  AccountName?: string;
  Location?: string;
  CCARole?: string;
  HiringManager?: number;
  RequiredFrom?: string;
  ClientEvaluation?: string;
  SOState?: string;
  AssignedToResource?: number;
  RequiredGrade?: string;
  EmployeeGrade?: string;
  EmployeeName?: string;
}

interface PriorityMatchingListProps {
  userEmail: string;
}

const PriorityMatchingList: React.FC<PriorityMatchingListProps> = ({ userEmail }) => {
  const [matchings, setMatchings] = useState<PriorityMatching[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Willing' | 'Not Willing' | 'Pending'>('All');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatchings = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
        const encodedEmail = encodeURIComponent(userEmail);
        const response = await axios.get(`${apiUrl}/priority-matching/email/${encodedEmail}`);
        
        if (response.data.success) {
          setMatchings(response.data.data);
        } else {
          setError(response.data.message || 'Failed to fetch priority matching records');
        }
      } catch (err: any) {
        console.error('Error fetching priority matchings:', err);
        setError(err.response?.data?.message || 'Failed to fetch priority matching records');
      } finally {
        setLoading(false);
      }
    };

    if (userEmail) {
      fetchMatchings();
    }
  }, [userEmail]);

  const handleWillingnessUpdate = async (matchingListId: number, willing: boolean) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      await axios.put(`${apiUrl}/priority-matching/${matchingListId}/willingness`, {
        associateWilling: willing
      });

      // Update local state
      setMatchings(prevMatchings =>
        prevMatchings.map(matching =>
          matching.MatchingListID === matchingListId
            ? { ...matching, AssociateWilling: willing }
            : matching
        )
      );
    } catch (err: any) {
      console.error('Error updating willingness:', err);
      // You could add a toast notification here
    }
  };

  const filteredMatchings = matchings.filter(matching => {
    switch (filter) {
      case 'Willing': return matching.AssociateWilling === true;
      case 'Not Willing': return matching.AssociateWilling === false;
      case 'Pending': return matching.AssociateWilling === null || matching.AssociateWilling === undefined;
      default: return true;
    }
  });

  const getPriorityColor = (priority: number) => {
    if (priority <= 2) return '#dc2626'; // High priority (1-2)
    if (priority <= 4) return '#f59e0b'; // Medium priority (3-4)
    return '#10b981'; // Low priority (5+)
  };

  const getPriorityLabel = (priority: number) => {
    if (priority <= 2) return 'High';
    if (priority <= 4) return 'Medium';
    return 'Low';
  };

  const getWillingnessColor = (willing: boolean | null | undefined) => {
    if (willing === true) return '#10b981'; // Green for willing
    if (willing === false) return '#dc2626'; // Red for not willing
    return '#6b7280'; // Gray for pending
  };

  const getWillingnessLabel = (willing: boolean | null | undefined) => {
    if (willing === true) return 'Willing';
    if (willing === false) return 'Not Willing';
    return 'Pending';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // Green for high scores
    if (score >= 60) return '#f59e0b'; // Yellow for medium scores
    return '#dc2626'; // Red for low scores
  };

  if (loading) {
    return (
      <div style={containerStyles}>
        <div style={loadingStyles}>
          <div style={spinnerStyles}></div>
          <p>Loading your priority matching records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyles}>
        <div style={errorStyles}>
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} style={retryButtonStyles}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <h2 style={titleStyles}>My Priority Matching List</h2>
        <div style={filterContainerStyles}>
          {['All', 'Willing', 'Not Willing', 'Pending'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption as any)}
              style={{
                ...filterButtonStyles,
                ...(filter === filterOption ? activeFilterStyles : {})
              }}
            >
              {filterOption}
            </button>
          ))}
        </div>
      </div>

      <div style={ordersGridStyles}>
        {filteredMatchings.map((matching) => (
          <div key={matching.MatchingListID} style={orderCardStyles}>
            <div style={cardHeaderStyles}>
              <div>
                <h3 style={orderTitleStyles}>
                  {matching.CCARole ? `${matching.CCARole} - ${matching.AccountName}` : `Service Order #${matching.ServiceOrderID}`}
                </h3>
                <p style={orderIdStyles}>Matching ID: #{matching.MatchingListID}</p>
                <p style={orderIdStyles}>📍 {matching.Location || 'Location not specified'}</p>
              </div>
              <div style={badgeContainerStyles}>
                <span 
                  style={{
                    ...priorityBadgeStyles,
                    backgroundColor: getPriorityColor(matching.Priority)
                  }}
                >
                  {getPriorityLabel(matching.Priority)} ({matching.Priority})
                </span>
                <span 
                  style={{
                    ...statusBadgeStyles,
                    backgroundColor: getWillingnessColor(matching.AssociateWilling)
                  }}
                >
                  {getWillingnessLabel(matching.AssociateWilling)}
                </span>
                <span 
                  style={{
                    ...scoreBadgeStyles,
                    backgroundColor: getScoreColor(matching.MatchingIndexScore)
                  }}
                >
                  Score: {matching.MatchingIndexScore}
                </span>
              </div>
            </div>
            
            <p style={descriptionStyles}>
              <strong>Role:</strong> {matching.CCARole || 'Not specified'}<br/>
              <strong>Account:</strong> {matching.AccountName || 'Not specified'}<br/>
              <strong>Required From:</strong> {matching.RequiredFrom ? new Date(matching.RequiredFrom).toLocaleDateString() : 'Not specified'}<br/>
              <strong>Grade Required:</strong> {matching.RequiredGrade || 'Not specified'}<br/>
              <strong>State:</strong> {matching.SOState || 'Not specified'}
            </p>
            
            {(matching.Remarks || matching.ClientEvaluation) && (
              <div style={remarksStyles}>
                {matching.Remarks && (
                  <div><strong>Internal Remarks:</strong> {matching.Remarks}</div>
                )}
                {matching.ClientEvaluation && (
                  <div><strong>Client Evaluation:</strong> {matching.ClientEvaluation}</div>
                )}
              </div>
            )}
            
            <div style={orderDetailsStyles}>
              <div style={detailItemStyles}>
                <strong>Service Order ID:</strong> {matching.ServiceOrderID}
              </div>
              <div style={detailItemStyles}>
                <strong>Matching Score:</strong> {matching.MatchingIndexScore}/100
              </div>
              <div style={detailItemStyles}>
                <strong>Priority Rank:</strong> {matching.Priority}
              </div>
              <div style={detailItemStyles}>
                <strong>Your Grade:</strong> {matching.EmployeeGrade}
              </div>
              <div style={detailItemStyles}>
                <strong>Required Grade:</strong> {matching.RequiredGrade}
              </div>
              {matching.HiringManager && (
                <div style={detailItemStyles}>
                  <strong>Hiring Manager ID:</strong> {matching.HiringManager}
                </div>
              )}
            </div>

            <div style={actionButtonsStyles}>
              <button
                onClick={() => handleWillingnessUpdate(matching.MatchingListID, true)}
                style={{
                  ...actionButtonStyles,
                  backgroundColor: matching.AssociateWilling === true ? '#10b981' : '#e5e7eb',
                  color: matching.AssociateWilling === true ? 'white' : '#374151'
                }}
              >
                ✓ I'm Willing
              </button>
              <button
                onClick={() => handleWillingnessUpdate(matching.MatchingListID, false)}
                style={{
                  ...actionButtonStyles,
                  backgroundColor: matching.AssociateWilling === false ? '#dc2626' : '#e5e7eb',
                  color: matching.AssociateWilling === false ? 'white' : '#374151'
                }}
              >
                ✗ Not Interested
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredMatchings.length === 0 && (
        <div style={emptyStateStyles}>
          <p>No priority matching records found for the selected filter.</p>
          {matchings.length === 0 && (
            <p>You don't have any service order matches at the moment.</p>
          )}
        </div>
      )}
    </div>
  );
};

// Styles (same base styles as ServiceOrders with some additions)
const containerStyles: React.CSSProperties = {
  padding: '2rem',
  backgroundColor: '#f8fafc',
  minHeight: 'calc(100vh - 120px)'
};

const headerStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2rem'
};

const titleStyles: React.CSSProperties = {
  color: '#1e293b',
  margin: 0,
  fontSize: '2rem',
  fontWeight: 'bold'
};

const filterContainerStyles: React.CSSProperties = {
  display: 'flex',
  gap: '0.5rem'
};

const filterButtonStyles: React.CSSProperties = {
  padding: '0.5rem 1rem',
  border: '1px solid #d1d5db',
  backgroundColor: 'white',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.9rem',
  transition: 'all 0.2s'
};

const activeFilterStyles: React.CSSProperties = {
  backgroundColor: '#3b82f6',
  color: 'white',
  borderColor: '#3b82f6'
};

const ordersGridStyles: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
  gap: '1.5rem'
};

const orderCardStyles: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '12px',
  padding: '1.5rem',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  border: '1px solid #e5e7eb'
};

const cardHeaderStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '1rem'
};

const orderTitleStyles: React.CSSProperties = {
  margin: '0 0 0.25rem 0',
  fontSize: '1.25rem',
  fontWeight: 'bold',
  color: '#1e293b'
};

const orderIdStyles: React.CSSProperties = {
  margin: 0,
  fontSize: '0.9rem',
  color: '#6b7280'
};

const badgeContainerStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem'
};

const priorityBadgeStyles: React.CSSProperties = {
  padding: '0.25rem 0.5rem',
  borderRadius: '4px',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  color: 'white',
  textAlign: 'center' as const
};

const statusBadgeStyles: React.CSSProperties = {
  padding: '0.25rem 0.5rem',
  borderRadius: '4px',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  color: 'white',
  textAlign: 'center' as const
};

const scoreBadgeStyles: React.CSSProperties = {
  padding: '0.25rem 0.5rem',
  borderRadius: '4px',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  color: 'white',
  textAlign: 'center' as const
};

const descriptionStyles: React.CSSProperties = {
  color: '#4b5563',
  marginBottom: '1rem',
  lineHeight: '1.5'
};

const remarksStyles: React.CSSProperties = {
  color: '#4b5563',
  marginBottom: '1rem',
  padding: '0.75rem',
  backgroundColor: '#f3f4f6',
  borderRadius: '6px',
  fontSize: '0.9rem'
};

const orderDetailsStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  borderTop: '1px solid #e5e7eb',
  paddingTop: '1rem',
  marginBottom: '1rem'
};

const detailItemStyles: React.CSSProperties = {
  fontSize: '0.9rem',
  color: '#4b5563'
};

const actionButtonsStyles: React.CSSProperties = {
  display: 'flex',
  gap: '0.5rem',
  marginTop: '1rem'
};

const actionButtonStyles: React.CSSProperties = {
  flex: 1,
  padding: '0.75rem',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontWeight: 'bold',
  transition: 'all 0.2s'
};

const loadingStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '400px',
  gap: '1rem'
};

const spinnerStyles: React.CSSProperties = {
  width: '40px',
  height: '40px',
  border: '4px solid #f3f4f6',
  borderTop: '4px solid #3b82f6',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite'
};

const errorStyles: React.CSSProperties = {
  textAlign: 'center' as const,
  padding: '3rem',
  color: '#dc2626'
};

const retryButtonStyles: React.CSSProperties = {
  marginTop: '1rem',
  padding: '0.75rem 1.5rem',
  backgroundColor: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '1rem'
};

const emptyStateStyles: React.CSSProperties = {
  textAlign: 'center' as const,
  padding: '3rem',
  color: '#6b7280'
};

export default PriorityMatchingList;
