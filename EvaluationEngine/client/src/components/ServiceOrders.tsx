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


// ...existing code...
export default ServiceOrders;
