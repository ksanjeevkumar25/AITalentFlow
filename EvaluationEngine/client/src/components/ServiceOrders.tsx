import React, { useState, useEffect } from 'react';

interface ServiceOrderMatch {
  MatchingListID: number;
  EmployeeID: number;
  EmployeeName: string;
  MatchingIndexScore: number;
  Remarks: string;
  Priority: number;
  AssociateWilling: boolean;
  EmployeeGrade: string;
}

interface ServiceOrder {
  ServiceOrderID: number;
  AccountName: string;
  Location: string;
  CCARole: string;
  HiringManager: number;
  RequiredFrom: string;
  ClientEvaluation: string;
  SOState: string;
  AssignedToResource: number;
  Grade: string;
  matches: ServiceOrderMatch[];
  totalMatches: number;
}

interface ServiceOrdersProps {
  userEmail: string;
}

const ServiceOrders: React.FC<ServiceOrdersProps> = ({ userEmail }) => {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'All' | 'Open' | 'In Progress' | 'Completed' | 'Assigned'>('All');
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);

  useEffect(() => {
    const fetchServiceOrders = async () => {
      if (!userEmail) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/service-orders/hiring-manager/${encodeURIComponent(userEmail)}`);
        const data = await response.json();
        
        if (data.success) {
          setOrders(data.data || []);
        } else {
          setError(data.message || 'Failed to fetch service orders');
        }
      } catch (err) {
        console.error('Error fetching service orders:', err);
        setError('Failed to fetch service orders');
      } finally {
        setLoading(false);
      }
    };

    fetchServiceOrders();
  }, [userEmail]);

  const filteredOrders = orders.filter(order => {
    switch (filter) {
      case 'All': return true;
      case 'Open': return order.SOState === 'Open';
      case 'In Progress': return order.SOState === 'In Progress';
      case 'Completed': return order.SOState === 'Completed';
      case 'Assigned': return order.AssignedToResource !== null && order.AssignedToResource !== 0;
      default: return true;
    }
  });

  const getPriorityColor = (priority: number) => {
    if (priority <= 2) return '#dc2626'; // High priority
    if (priority <= 4) return '#f59e0b'; // Medium priority
    return '#10b981'; // Low priority
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return '#3b82f6';
      case 'In Progress': return '#f59e0b';
      case 'Completed': return '#10b981';
      case 'Assigned': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getMatchingScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // Green for high scores
    if (score >= 60) return '#f59e0b'; // Yellow for medium scores
    return '#dc2626'; // Red for low scores
  };

  const getWillingnessColor = (willing: boolean | null) => {
    if (willing === true) return '#10b981';
    if (willing === false) return '#dc2626';
    return '#6b7280'; // Gray for pending/null
  };

  const getWillingnessText = (willing: boolean | null) => {
    if (willing === true) return 'Willing';
    if (willing === false) return 'Not Willing';
    return 'Pending';
  };

  const handleAllocateResource = async (serviceOrderId: number, employeeId: number, employeeName: string) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/service-orders/allocate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceOrderId,
          employeeId,
          userEmail
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`✅ Successfully allocated ${employeeName} to Service Order #${serviceOrderId}`);
        
        // Refresh the service orders to show updated status
        const refreshResponse = await fetch(`${apiUrl}/service-orders/hiring-manager/${encodeURIComponent(userEmail)}`);
        const refreshData = await refreshResponse.json();
        
        if (refreshData.success) {
          setOrders(refreshData.data || []);
          
          // Update selected order if it was the one we just allocated to
          const updatedOrder = refreshData.data.find((order: ServiceOrder) => order.ServiceOrderID === serviceOrderId);
          if (updatedOrder && selectedOrder?.ServiceOrderID === serviceOrderId) {
            setSelectedOrder(updatedOrder);
          }
        }
      } else {
        alert(`❌ Failed to allocate resource: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error allocating resource:', error);
      alert(`❌ Error allocating resource: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <div style={containerStyles}>
        <div style={loadingStyles}>
          <div style={spinnerStyles}></div>
          <p>Loading my service orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyles}>
        <div style={errorStyles}>
          <p>Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={retryButtonStyles}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <h2 style={titleStyles}>My Service Orders</h2>
        <div style={filterContainerStyles}>
          {['All', 'Open', 'In Progress', 'Completed', 'Assigned'].map((filterOption) => (
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

      <div style={mainContentStyles}>
        {/* Left Panel - Service Orders List */}
        <div style={leftPanelStyles}>
          <div style={panelHeaderStyles}>
            <h3 style={panelTitleStyles}>Service Orders ({filteredOrders.length})</h3>
          </div>
          <div style={ordersListStyles}>
            {filteredOrders.map((order) => (
              <div 
                key={order.ServiceOrderID} 
                style={{
                  ...orderItemStyles,
                  ...(selectedOrder?.ServiceOrderID === order.ServiceOrderID ? selectedOrderStyles : {})
                }}
                onClick={() => setSelectedOrder(order)}
              >
                <div style={orderItemHeaderStyles}>
                  <h4 style={orderItemTitleStyles}>{order.CCARole}</h4>
                  <span style={{
                    ...orderStatusBadgeStyles,
                    backgroundColor: getStatusColor(order.SOState)
                  }}>
                    {order.SOState}
                  </span>
                </div>
                
                <p style={orderItemAccountStyles}>{order.AccountName}</p>
                <div style={orderItemDetailsStyles}>
                  <span style={orderItemDetailStyles}>📍 {order.Location}</span>
                  <span style={orderItemDetailStyles}>🎓 {order.Grade}</span>
                  <span style={orderItemDetailStyles}>👥 {order.totalMatches} matches</span>
                </div>
                
                <div style={orderItemDetailsStyles}>
                  <span style={orderItemDetailStyles}>🆔 SO#{order.ServiceOrderID}</span>
                  {order.AssignedToResource && (
                    <span style={orderItemDetailStyles}>👤 Assigned: {order.AssignedToResource}</span>
                  )}
                  <span style={orderItemDetailStyles}>👨‍💼 HM: {order.HiringManager}</span>
                </div>
                
                <p style={orderItemDateStyles}>
                  Required from: {order.RequiredFrom ? new Date(order.RequiredFrom).toLocaleDateString() : 'N/A'}
                </p>
                
                {order.ClientEvaluation && (
                  <div style={orderItemEvaluationStyles}>
                    <p style={orderItemEvaluationTextStyles}>
                      📋 {order.ClientEvaluation.length > 80 
                        ? order.ClientEvaluation.substring(0, 80) + '...' 
                        : order.ClientEvaluation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <div style={emptyStateStyles}>
              <p>No service orders found for the selected filter.</p>
            </div>
          )}
        </div>

        {/* Right Panel - Matching Resources */}
        <div style={rightPanelStyles}>
          {selectedOrder ? (
            <>
              <div style={rightPanelHeaderStyles}>
                <h3 style={panelTitleStyles}>Matching Resources</h3>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  style={closePanelButtonStyles}
                >
                  ✕
                </button>
              </div>

              <div style={selectedOrderDetailsStyles}>
                <h4 style={selectedOrderTitleStyles}>{selectedOrder.CCARole}</h4>
                <p style={selectedOrderAccountStyles}>{selectedOrder.AccountName}</p>
              </div>

              <div style={matchesSectionStyles}>
                <h4 style={matchesSectionTitleStyles}>
                  Matching Resources ({selectedOrder.totalMatches})
                </h4>
                
                <div style={matchesGridStyles}>
                  {selectedOrder.matches.length > 0 ? (
                    selectedOrder.matches.map((match) => (
                      <div key={match.MatchingListID} style={matchResourceCardStyles}>
                        <div style={matchResourceHeaderStyles}>
                          <span style={employeeNameLargeStyles}>{match.EmployeeName}</span>
                          <div style={matchBadgesContainerStyles}>
                            <span style={{
                              ...priorityBadgeStyles,
                              backgroundColor: getPriorityColor(match.Priority)
                            }}>
                              Priority {match.Priority}
                            </span>
                            <span style={{
                              ...scoreBadgeStyles,
                              backgroundColor: getMatchingScoreColor(match.MatchingIndexScore)
                            }}>
                              {match.MatchingIndexScore}% Match
                            </span>
                          </div>
                        </div>
                        
                        <div style={matchResourceDetailsStyles}>
                          <div style={matchDetailRowStyles}>
                            <span style={matchDetailLabelStyles}>🎓 Grade:</span>
                            <span>{match.EmployeeGrade}</span>
                          </div>
                          <div style={matchDetailRowStyles}>
                            <span style={matchDetailLabelStyles}>💼 Willingness:</span>
                            <span style={{
                              ...willingnessStatusStyles,
                              backgroundColor: getWillingnessColor(match.AssociateWilling)
                            }}>
                              {getWillingnessText(match.AssociateWilling)}
                            </span>
                          </div>
                        </div>

                        {/* Bottom section with remarks and allocate button in single row */}
                        <div style={bottomSectionStyles}>
                          {match.Remarks && (
                            <div style={remarksInlineContainerStyles}>
                              <span style={remarksLabelStyles}>💬 Remarks:</span>
                              <p style={remarksInlineTextStyles}>{match.Remarks}</p>
                            </div>
                          )}

                          {/* Show Allocate button if resource is willing and client evaluation is not required and not already assigned */}
                          {match.AssociateWilling && 
                           selectedOrder.ClientEvaluation !== 'Yes' && 
                           !selectedOrder.AssignedToResource && (
                            <div style={allocateButtonInlineContainerStyles}>
                              <button
                                style={allocateButtonInlineStyles}
                                onClick={() => handleAllocateResource(selectedOrder.ServiceOrderID, match.EmployeeID, match.EmployeeName)}
                              >
                                🎯 Allocate
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={noMatchesContainerStyles}>
                      <p style={noMatchesTextStyles}>No matching resources found for this service order.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div style={placeholderPanelStyles}>
              <div style={placeholderContentStyles}>
                <h3 style={placeholderTitleStyles}>Select a Service Order</h3>
                <p style={placeholderTextStyles}>
                  Click on a service order from the left panel to view its details and matching resources.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Styles
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

const descriptionStyles: React.CSSProperties = {
  color: '#4b5563',
  marginBottom: '1rem',
  lineHeight: '1.5'
};

const orderDetailsStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  borderTop: '1px solid #e5e7eb',
  paddingTop: '1rem'
};

const detailItemStyles: React.CSSProperties = {
  fontSize: '0.9rem',
  color: '#4b5563'
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

const emptyStateStyles: React.CSSProperties = {
  textAlign: 'center' as const,
  padding: '3rem',
  color: '#6b7280'
};

// New styles for the updated component
const errorStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '400px',
  gap: '1rem',
  color: '#dc2626'
};

const retryButtonStyles: React.CSSProperties = {
  padding: '0.5rem 1rem',
  backgroundColor: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: '0.375rem',
  cursor: 'pointer',
  fontSize: '0.875rem'
};

const accountStyles: React.CSSProperties = {
  fontSize: '0.875rem',
  color: '#6b7280',
  margin: '0.25rem 0 0 0'
};

const assignedBadgeStyles: React.CSSProperties = {
  padding: '0.25rem 0.5rem',
  borderRadius: '0.375rem',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  color: 'white'
};

const detailRowStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '0.5rem'
};

const detailLabelStyles: React.CSSProperties = {
  fontWeight: '500',
  color: '#374151'
};

const evaluationStyles: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  padding: '1rem',
  borderRadius: '0.5rem',
  margin: '1rem 0',
  border: '1px solid #e5e7eb'
};

const matchesHeaderStyles: React.CSSProperties = {
  borderTop: '1px solid #e5e7eb',
  paddingTop: '1rem',
  marginTop: '1rem'
};

const matchesTitleStyles: React.CSSProperties = {
  margin: '0 0 1rem 0',
  fontSize: '1.125rem',
  fontWeight: '600',
  color: '#374151'
};

const matchesContainerStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem'
};

const matchCardStyles: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  padding: '0.75rem',
  borderRadius: '0.5rem',
  border: '1px solid #e2e8f0'
};

const matchHeaderStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '0.5rem'
};

const employeeNameStyles: React.CSSProperties = {
  fontWeight: '500',
  color: '#1f2937'
};

const matchBadgesStyles: React.CSSProperties = {
  display: 'flex',
  gap: '0.5rem'
};

const scoreBadgeStyles: React.CSSProperties = {
  padding: '0.125rem 0.375rem',
  borderRadius: '0.25rem',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  color: 'white'
};

const willingnessBadgeStyles: React.CSSProperties = {
  padding: '0.125rem 0.375rem',
  borderRadius: '0.25rem',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  color: 'white'
};

const matchDetailsStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem'
};

const gradeStyles: React.CSSProperties = {
  fontSize: '0.875rem',
  color: '#6b7280'
};

const remarksStyles: React.CSSProperties = {
  fontSize: '0.875rem',
  color: '#4b5563',
  fontStyle: 'italic',
  margin: '0.25rem 0 0 0'
};

const noMatchesStyles: React.CSSProperties = {
  textAlign: 'center' as const,
  color: '#9ca3af',
  fontStyle: 'italic',
  padding: '1rem'
};

// New styles for two-panel layout
const mainContentStyles: React.CSSProperties = {
  display: 'flex',
  gap: '1.5rem',
  height: 'calc(100vh - 200px)',
  minHeight: '600px'
};

//Update the left panel to include header
const leftPanelStyles: React.CSSProperties = {
  width: '40%',
  backgroundColor: 'white',
  borderRadius: '0.75rem',
  border: '1px solid #e5e7eb',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column'
};

const panelHeaderStyles: React.CSSProperties = {
  padding: '1.5rem',
  borderBottom: '1px solid #e5e7eb',
  backgroundColor: '#f9fafb'
};

const rightPanelStyles: React.CSSProperties = {
  width: '60%',
  backgroundColor: 'white',
  borderRadius: '0.75rem',
  border: '1px solid #e5e7eb',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column'
};

const panelTitleStyles: React.CSSProperties = {
  margin: '0',
  fontSize: '1.25rem',
  fontWeight: '600',
  color: '#1f2937'
};

const ordersListStyles: React.CSSProperties = {
  flex: 1,
  overflow: 'auto',
  padding: '0.5rem'
};

const orderItemStyles: React.CSSProperties = {
  padding: '1rem',
  border: '1px solid #e5e7eb',
  borderRadius: '0.5rem',
  marginBottom: '0.75rem',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  backgroundColor: '#fafafa'
};

const selectedOrderStyles: React.CSSProperties = {
  backgroundColor: '#eff6ff',
  borderColor: '#3b82f6',
  boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.1)'
};

const orderItemHeaderStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '0.5rem'
};

const orderItemTitleStyles: React.CSSProperties = {
  margin: '0',
  fontSize: '1.125rem',
  fontWeight: '600',
  color: '#1f2937'
};

const orderStatusBadgeStyles: React.CSSProperties = {
  padding: '0.25rem 0.5rem',
  borderRadius: '0.375rem',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  color: 'white'
};

const orderItemAccountStyles: React.CSSProperties = {
  margin: '0 0 0.75rem 0',
  fontSize: '0.875rem',
  color: '#6b7280',
  fontWeight: '500'
};

const orderItemDetailsStyles: React.CSSProperties = {
  display: 'flex',
  gap: '1rem',
  marginBottom: '0.5rem',
  flexWrap: 'wrap'
};

const orderItemDetailStyles: React.CSSProperties = {
  fontSize: '0.75rem',
  color: '#4b5563',
  backgroundColor: '#f3f4f6',
  padding: '0.25rem 0.5rem',
  borderRadius: '0.25rem'
};

const orderItemDateStyles: React.CSSProperties = {
  margin: '0',
  fontSize: '0.75rem',
  color: '#6b7280'
};

const orderItemEvaluationStyles: React.CSSProperties = {
  marginTop: '0.75rem',
  padding: '0.5rem',
  backgroundColor: '#f9fafb',
  borderRadius: '0.375rem',
  borderLeft: '3px solid #3b82f6'
};

const orderItemEvaluationTextStyles: React.CSSProperties = {
  margin: '0',
  fontSize: '0.75rem',
  color: '#4b5563',
  fontStyle: 'italic'
};

const rightPanelHeaderStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1.5rem',
  borderBottom: '1px solid #e5e7eb'
};

const closePanelButtonStyles: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: '1.25rem',
  cursor: 'pointer',
  color: '#6b7280',
  padding: '0.25rem',
  borderRadius: '0.25rem',
  width: '2rem',
  height: '2rem'
};

const selectedOrderDetailsStyles: React.CSSProperties = {
  padding: '1.5rem',
  borderBottom: '1px solid #e5e7eb'
};

const selectedOrderTitleStyles: React.CSSProperties = {
  margin: '0 0 0.5rem 0',
  fontSize: '1.5rem',
  fontWeight: '700',
  color: '#1f2937'
};

const selectedOrderAccountStyles: React.CSSProperties = {
  margin: '0 0 1.5rem 0',
  fontSize: '1.125rem',
  color: '#6b7280',
  fontWeight: '500'
};

const orderDetailsGridStyles: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '0.75rem'
};

const statusInlineStyles: React.CSSProperties = {
  padding: '0.25rem 0.5rem',
  borderRadius: '0.375rem',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  color: 'white'
};

const evaluationSectionStyles: React.CSSProperties = {
  marginTop: '1.5rem',
  padding: '1rem',
  backgroundColor: '#f9fafb',
  borderRadius: '0.5rem',
  border: '1px solid #e5e7eb'
};

const sectionTitleStyles: React.CSSProperties = {
  margin: '0 0 0.75rem 0',
  fontSize: '1rem',
  fontWeight: '600',
  color: '#374151'
};

const evaluationTextStyles: React.CSSProperties = {
  margin: '0',
  fontSize: '0.875rem',
  color: '#4b5563',
  lineHeight: '1.5'
};

const matchesSectionStyles: React.CSSProperties = {
  flex: 1,
  padding: '1.5rem',
  overflow: 'auto'
};

const matchesSectionTitleStyles: React.CSSProperties = {
  margin: '0 0 1rem 0',
  fontSize: '1.25rem',
  fontWeight: '600',
  color: '#1f2937'
};

const matchesGridStyles: React.CSSProperties = {
  display: 'grid',
  gap: '1rem'
};

const matchResourceCardStyles: React.CSSProperties = {
  padding: '1rem',
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '0.75rem'
};

const matchResourceHeaderStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '1rem'
};

const employeeNameLargeStyles: React.CSSProperties = {
  fontSize: '1.125rem',
  fontWeight: '600',
  color: '#1f2937'
};

const matchBadgesContainerStyles: React.CSSProperties = {
  display: 'flex',
  gap: '0.5rem',
  flexWrap: 'wrap'
};

const matchResourceDetailsStyles: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '0.75rem',
  marginBottom: '1rem'
};

const matchDetailRowStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem'
};

const matchDetailLabelStyles: React.CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: '500',
  color: '#374151'
};

const willingnessStatusStyles: React.CSSProperties = {
  padding: '0.125rem 0.5rem',
  borderRadius: '0.375rem',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  color: 'white'
};

const remarksContainerStyles: React.CSSProperties = {
  borderTop: '1px solid #e5e7eb',
  paddingTop: '0.75rem'
};

const remarksLabelStyles: React.CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: '500',
  color: '#374151',
  marginBottom: '0.5rem'
};

const remarksTextStyles: React.CSSProperties = {
  margin: '0',
  fontSize: '0.875rem',
  color: '#4b5563',
  fontStyle: 'italic',
  lineHeight: '1.4'
};

const noMatchesContainerStyles: React.CSSProperties = {
  textAlign: 'center' as const,
  padding: '2rem',
  color: '#9ca3af'
};

const noMatchesTextStyles: React.CSSProperties = {
  margin: '0',
  fontSize: '0.875rem',
  fontStyle: 'italic'
};

const placeholderPanelStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  backgroundColor: '#f9fafb'
};

const placeholderContentStyles: React.CSSProperties = {
  textAlign: 'center' as const,
  maxWidth: '300px',
  padding: '2rem'
};

const placeholderTitleStyles: React.CSSProperties = {
  margin: '0 0 1rem 0',
  fontSize: '1.25rem',
  fontWeight: '600',
  color: '#6b7280'
};

const placeholderTextStyles: React.CSSProperties = {
  margin: '0',
  fontSize: '0.875rem',
  color: '#9ca3af',
  lineHeight: '1.5'
};

const allocateButtonContainerStyles: React.CSSProperties = {
  marginTop: '1.5rem',
  paddingTop: '1rem',
  borderTop: '1px solid #e5e7eb'
};

const allocateButtonStyles: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  backgroundColor: '#10b981',
  color: 'white',
  border: 'none',
  borderRadius: '0.5rem',
  fontSize: '0.875rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem'
};

// New styles for inline layout
const bottomSectionStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '1rem',
  marginTop: '1rem',
  paddingTop: '0.75rem',
  borderTop: '1px solid #e5e7eb'
};

const remarksInlineContainerStyles: React.CSSProperties = {
  flex: 1,
  minWidth: 0 // Allow shrinking
};

const remarksInlineTextStyles: React.CSSProperties = {
  margin: '0',
  fontSize: '0.875rem',
  color: '#4b5563',
  fontStyle: 'italic',
  lineHeight: '1.4'
};

const allocateButtonInlineContainerStyles: React.CSSProperties = {
  flexShrink: 0 // Prevent button from shrinking
};

const allocateButtonInlineStyles: React.CSSProperties = {
  padding: '0.75rem 1.5rem',
  backgroundColor: '#10b981',
  color: 'white',
  border: 'none',
  borderRadius: '0.5rem',
  fontSize: '0.875rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  whiteSpace: 'nowrap'
};

export default ServiceOrders;
