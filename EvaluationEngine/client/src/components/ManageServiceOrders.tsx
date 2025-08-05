import React, { useState, useEffect } from 'react';

interface ServiceOrderSkill {
  SOSkillID?: number;
  ServiceOrderID?: number;
  SkillID: number;
  SkillName?: string;
  SkillDescription?: string;
  Mandatory: boolean;
  SkillLevel: number;
}

interface ServiceOrder {
  ServiceOrderID?: number;
  AccountName: string;
  Location: string;
  CCARole: string;
  HiringManager: number;
  RequiredFrom: string;
  ClientEvaluation: string;
  SOState: string;
  AssignedToResource?: number;
  Grade: string;
  skills?: ServiceOrderSkill[];
}

interface Skill {
  SkillID: number;
  SkillName: string;
  SkillDescription: string;
}

interface Supervisor {
  EmployeeID: number;
  FullName: string;
  EmailID: string;
}

interface Grade {
  GradeID: number;
  Grade: string;
  GradeDescription: string;
}

interface ManageServiceOrdersProps {
  userEmail: string;
}

const ManageServiceOrders: React.FC<ManageServiceOrdersProps> = ({ userEmail }) => {
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ServiceOrder | null>(null);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<ServiceOrderSkill[]>([]);
  const [showNewSkillForm, setShowNewSkillForm] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [skillError, setSkillError] = useState<string>('');
  const [skillLoading, setSkillLoading] = useState<boolean>(false);
  const [selectedSkillId, setSelectedSkillId] = useState<string>('');
  const [skillLevel, setSkillLevel] = useState<number>(1);
  const [isMandatory, setIsMandatory] = useState<boolean>(false);
  const [currentUserEmployee, setCurrentUserEmployee] = useState<Supervisor | null>(null);
  const [formData, setFormData] = useState<ServiceOrder>({
    AccountName: '',
    Location: '',
    CCARole: '',
    HiringManager: 0,
    RequiredFrom: '',
    ClientEvaluation: '',
    SOState: 'Open',
    Grade: '',
    skills: []
  });

  // Update formData when currentUserEmployee changes
  useEffect(() => {
    if (currentUserEmployee && !editingOrder && formData.HiringManager === 0) {
      setFormData(prev => ({
        ...prev,
        HiringManager: currentUserEmployee.EmployeeID
      }));
    }
  }, [currentUserEmployee, editingOrder, formData.HiringManager]);

  const fetchServiceOrders = async () => {
    try {
      if (!userEmail) {
        setError('Please log in to view service orders');
        return;
      }
      
      setLoading(true);
      const encodedEmail = encodeURIComponent(userEmail);
      console.log('Fetching service orders for email:', userEmail);
      console.log('Encoded email:', encodedEmail);
      
      const apiUrl = `/api/service-orders/all/${encodedEmail}`;
      console.log('Request URL:', apiUrl);
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (data.success) {
        setServiceOrders(data.data);
      } else {
        if (response.status === 404) {
          setError('Your email is not registered as an employee. Please contact your administrator.');
        } else {
          setError(data.message || 'Failed to fetch service orders');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error';
      setError(`Failed to fetch service orders: ${errorMessage}`);
      console.error('Error fetching service orders:', err);
      console.error('Request URL was for email:', userEmail);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceOrders();
    fetchSkills();
    fetchSupervisors();
    fetchGrades();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail]);

  // Also fetch supervisors immediately when component mounts, regardless of userEmail
  useEffect(() => {
    fetchSupervisors();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSkills = async () => {
    try {
      if (!userEmail) {
        return; // Don't fetch skills if no user email
      }
      
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/skills`);
      const data = await response.json();
      
      if (data.success) {
        setAvailableSkills(data.data);
      } else {
        console.error('Failed to fetch skills:', data.message);
      }
    } catch (err) {
      console.error('Error fetching skills:', err);
    }
  };

  const fetchSupervisors = async () => {
    try {
      console.log('fetchSupervisors called with userEmail:', userEmail);
      
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/supervisors`);
      console.log('Supervisors API response status:', response.status);
      console.log('Supervisors API response ok:', response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Supervisors API response data:', data);
      
      if (data.success && Array.isArray(data.data)) {
        setSupervisors(data.data);
        console.log('Set supervisors to state, count:', data.data.length);
        
        // Find the current user in the supervisors list
        if (userEmail) {
          const currentUser = data.data.find((supervisor: Supervisor) => 
            supervisor.EmailID === userEmail
          );
          if (currentUser) {
            setCurrentUserEmployee(currentUser);
            console.log('Found current user employee:', currentUser);
          } else {
            console.log('Current user not found in supervisors list, userEmail:', userEmail);
          }
        }
      } else {
        console.error('Invalid supervisors response format:', data);
        setSupervisors([]); // Set empty array as fallback
      }
    } catch (err) {
      console.error('Error fetching supervisors:', err);
      setSupervisors([]); // Set empty array as fallback
    }
  };

  const fetchGrades = async () => {
    try {
      if (!userEmail) {
        return; // Don't fetch grades if no user email
      }
      
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/grades`);
      const data = await response.json();
      
      if (data.success) {
        setGrades(data.data);
      } else {
        console.error('Failed to fetch grades:', data.message);
      }
    } catch (err) {
      console.error('Error fetching grades:', err);
    }
  };

  const handleAddSkill = () => {
    if (selectedSkillId) {
      const skill = availableSkills.find(s => s.SkillID === parseInt(selectedSkillId));
      if (skill && !selectedSkills.some(s => s.SkillID === skill.SkillID)) {
        const newSkill: ServiceOrderSkill = {
          SkillID: skill.SkillID,
          SkillName: skill.SkillName,
          SkillLevel: skillLevel,
          Mandatory: isMandatory
        };
        setSelectedSkills([...selectedSkills, newSkill]);
        setSelectedSkillId('');
        setSkillLevel(1);
        setIsMandatory(false);
      }
    }
  };

  const handleCreateNewSkill = async () => {
    if (!newSkillName.trim()) {
      setSkillError('Please enter a skill name');
      return;
    }

    setSkillLoading(true);
    setSkillError('');

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/skills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ SkillName: newSkillName.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        const newSkill = data.data;
        setAvailableSkills([...availableSkills, newSkill]);
        
        // Add the new skill to selected skills
        const newSelectedSkill: ServiceOrderSkill = {
          SkillID: newSkill.SkillID,
          SkillName: newSkill.SkillName,
          SkillLevel: skillLevel,
          Mandatory: isMandatory
        };
        setSelectedSkills([...selectedSkills, newSelectedSkill]);
        
        // Reset form
        setNewSkillName('');
        setSkillLevel(1);
        setIsMandatory(false);
        setShowNewSkillForm(false);
      } else {
        setSkillError(data.message || 'Failed to create skill');
      }
    } catch (err) {
      setSkillError('Error creating skill');
      console.error('Error creating skill:', err);
    } finally {
      setSkillLoading(false);
    }
  };

  const getSupervisorName = (employeeId: number): string => {
    const supervisor = supervisors.find(s => s.EmployeeID === employeeId);
    return supervisor ? supervisor.FullName : `ID: ${employeeId}`;
  };

  const handleRemoveSkill = (skillId: number) => {
    setSelectedSkills(selectedSkills.filter(s => s.SkillID !== skillId));
  };

  // Function to call the HTTP triggered function
  const callFunctionApp = async (serviceOrderId: number) => {
    try {
      const functionAppUrl = process.env.REACT_APP_FUNCTION_APP_URL;
      if (!functionAppUrl) {
        console.warn('Function app URL not configured in environment variables');
        return;
      }

      console.log('=== FUNCTION APP CALL STARTING ===');
      console.log(`Timestamp: ${new Date().toISOString()}`);
      console.log(`Service Order ID: ${serviceOrderId}`);
      console.log(`Function App URL: ${functionAppUrl}`);
      console.log(`Full endpoint: ${functionAppUrl}/api/MatchingProfileIndexer?serviceOrderId=${serviceOrderId}`);
      
      const response = await fetch(`${functionAppUrl}/api/MatchingProfileIndexer?serviceOrderId=${serviceOrderId}`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ serviceOrderId })
      });

      console.log('=== FUNCTION APP RESPONSE ===');
      console.log(`Response status: ${response.status}`);
      console.log(`Response ok: ${response.ok}`);
      console.log(`Response statusText: ${response.statusText}`);

      if (response.ok) {
        const responseData = await response.json();
        console.log('Function app response data:', responseData);
        console.log('✅ Function app called successfully');
        
        // Show success notification to user
        alert(`✅ Matching profile indexing completed for Service Order ${serviceOrderId}`);
      } else {
        const errorText = await response.text();
        console.error('❌ Function app call failed:', response.status, response.statusText);
        console.error('Error response body:', errorText);
        
        // Show error notification to user
        alert(`⚠️ Function app call failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('=== FUNCTION APP CALL ERROR ===');
      console.error('Error details:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      
      // Show error notification to user
      alert(`❌ Error calling function app: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Don't throw error to avoid breaking the main flow
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started');
    console.log('Form data:', formData);
    console.log('Selected skills:', selectedSkills);
    
    // Validate HiringManager
    if (!formData.HiringManager || formData.HiringManager === 0) {
      setError('Please select a Hiring Manager');
      return;
    }
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const url = editingOrder 
        ? `${apiUrl}/api/service-orders/${editingOrder.ServiceOrderID}`
        : `${apiUrl}/api/service-orders`;
      
      const method = editingOrder ? 'PUT' : 'POST';
      
      // Include skills in the submission data
      const submitData = {
        ...formData,
        skills: selectedSkills
      };
      
      console.log('Submitting data:', JSON.stringify(submitData, null, 2));
      console.log('Request URL:', url);
      console.log('Request method:', method);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        console.log('=== SERVICE ORDER SAVE SUCCESS ===');
        console.log('Response data:', data);
        
        const serviceOrderId = editingOrder ? editingOrder.ServiceOrderID : data.data?.ServiceOrderID;
        console.log(`Extracted Service Order ID: ${serviceOrderId}`);
        console.log(`Edit mode: ${!!editingOrder}`);
        
        if (serviceOrderId) {
          console.log('🚀 About to call function app...');
          // Call the function app after successful creation/update
          await callFunctionApp(serviceOrderId);
        } else {
          console.warn('⚠️ No service order ID found, skipping function app call');
          console.log('Data structure:', JSON.stringify(data, null, 2));
        }
        
        await fetchServiceOrders();
        setShowForm(false);
        setEditingOrder(null);
        resetForm();
      } else {
        setError(data.message || 'Failed to save service order');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('Failed to save service order');
      console.error('Error saving service order:', err);
    }
  };

  const handleEdit = (order: ServiceOrder) => {
    setEditingOrder(order);
    setFormData({
      AccountName: order.AccountName,
      Location: order.Location,
      CCARole: order.CCARole,
      HiringManager: order.HiringManager,
      RequiredFrom: order.RequiredFrom,
      ClientEvaluation: order.ClientEvaluation,
      SOState: order.SOState,
      Grade: order.Grade,
      AssignedToResource: order.AssignedToResource
    });
    setSelectedSkills(order.skills || []);
    setShowForm(true);
  };

  const handleDelete = async (serviceOrderId: number) => {
    if (!window.confirm('Are you sure you want to delete this service order?')) {
      return;
    }

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/service-orders/${serviceOrderId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchServiceOrders();
      } else {
        setError(data.message || 'Failed to delete service order');
      }
    } catch (err) {
      setError('Failed to delete service order');
      console.error('Error deleting service order:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      AccountName: '',
      Location: '',
      CCARole: '',
      HiringManager: currentUserEmployee?.EmployeeID || 0,
      RequiredFrom: '',
      ClientEvaluation: '',
      SOState: 'Open',
      Grade: ''
    });
    setSelectedSkills([]);
    setSelectedSkillId('');
    setSkillLevel(1);
    setIsMandatory(false);
    setNewSkillName('');
    setShowNewSkillForm(false);
    setSkillError('');
  };

  // Test function to check if function app is reachable
  const testFunctionApp = async () => {
    try {
      const functionAppUrl = process.env.REACT_APP_FUNCTION_APP_URL;
      if (!functionAppUrl) {
        alert('Function app URL not configured');
        return;
      }

      console.log('=== TESTING FUNCTION APP CONNECTION ===');
      console.log(`Testing URL: ${functionAppUrl}/api/HealthCheck`);
      
      const response = await fetch(`${functionAppUrl}/api/HealthCheck`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Health check response:', data);
        alert(`✅ Function App is running!\n\nStatus: ${data.Status}\nMessage: ${data.Message}\nTimestamp: ${data.Timestamp}`);
      } else {
        console.error('Health check failed:', response.status, response.statusText);
        alert(`❌ Health check failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Health check error:', error);
      alert(`❌ Cannot reach function app: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingOrder(null);
    resetForm();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open': return '#10b981';
      case 'in progress': return '#f59e0b';
      case 'completed': return '#3b82f6';
      case 'assigned': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  if (!userEmail) {
    return (
      <div style={containerStyles}>
        <div style={errorStyles}>
          <p>Please log in to manage service orders</p>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
            You need to log in with a valid employee email address to access this feature.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={containerStyles}>
        <div style={loadingStyles}>
          <div style={spinnerStyles}></div>
          <p>Loading service orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyles}>
        <div style={errorStyles}>
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()} style={retryButtonStyles}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <h2 style={titleStyles}>Manage Service Orders</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={testFunctionApp}
            style={{
              ...createButtonStyles,
              backgroundColor: '#10b981',
              fontSize: '0.9rem',
              padding: '0.6rem 1.2rem'
            }}
            title="Test if Function App is running"
          >
            🔧 Test Function App
          </button>
          <button 
            onClick={() => {
              setEditingOrder(null);
              resetForm();
              setShowForm(true);
            }} 
            style={createButtonStyles}
          >
            + Create New Service Order
          </button>
        </div>
      </div>

      {showForm && (
        <div style={modalOverlayStyles}>
          <div style={modalStyles}>
            <div style={modalHeaderStyles}>
              <h3>{editingOrder ? 'Edit Service Order' : 'Create New Service Order'}</h3>
              <button onClick={handleCancel} style={closeButtonStyles}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} style={formStyles}>
              <div style={formGridStyles}>
                <div style={formGroupStyles}>
                  <label style={labelStyles}>Account Name *</label>
                  <input
                    type="text"
                    value={formData.AccountName}
                    onChange={(e) => setFormData({...formData, AccountName: e.target.value})}
                    style={inputStyles}
                    required
                  />
                </div>

                <div style={formGroupStyles}>
                  <label style={labelStyles}>CCA Role *</label>
                  <input
                    type="text"
                    value={formData.CCARole}
                    onChange={(e) => setFormData({...formData, CCARole: e.target.value})}
                    style={inputStyles}
                    required
                  />
                </div>

                <div style={formGroupStyles}>
                  <label style={labelStyles}>Location *</label>
                  <input
                    type="text"
                    value={formData.Location}
                    onChange={(e) => setFormData({...formData, Location: e.target.value})}
                    style={inputStyles}
                    required
                  />
                </div>

                <div style={formGroupStyles}>
                  <label style={labelStyles}>Grade *</label>
                  <select
                    value={formData.Grade}
                    onChange={(e) => setFormData({...formData, Grade: e.target.value})}
                    style={inputStyles}
                    required
                  >
                    <option value="">Select Grade</option>
                    {grades.map((grade) => (
                      <option key={grade.GradeID} value={grade.Grade}>
                        {grade.Grade} - {grade.GradeDescription}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={formGroupStyles}>
                  <label style={labelStyles}>Hiring Manager *</label>
                  <select
                    value={formData.HiringManager}
                    onChange={(e) => setFormData({...formData, HiringManager: parseInt(e.target.value)})}
                    style={inputStyles}
                    required
                  >
                    <option value={0}>Select Hiring Manager</option>
                    {supervisors.length === 0 && (
                      <option value={0} disabled>Loading employees...</option>
                    )}
                    {supervisors.map((supervisor) => (
                      <option key={supervisor.EmployeeID} value={supervisor.EmployeeID}>
                        {supervisor.FullName} ({supervisor.EmailID})
                      </option>
                    ))}
                  </select>
                  {/* Debug info */}
                  <small style={{color: 'gray', fontSize: '12px'}}>
                    {supervisors.length > 0 ? `${supervisors.length} employees loaded` : 'No employees loaded'}
                  </small>
                </div>

                <div style={formGroupStyles}>
                  <label style={labelStyles}>Required From *</label>
                  <input
                    type="date"
                    value={formData.RequiredFrom}
                    onChange={(e) => setFormData({...formData, RequiredFrom: e.target.value})}
                    style={inputStyles}
                    required
                  />
                </div>

                <div style={formGroupStyles}>
                  <label style={labelStyles}>Status *</label>
                  <select
                    value={formData.SOState}
                    onChange={(e) => setFormData({...formData, SOState: e.target.value})}
                    style={inputStyles}
                    required
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div style={formGroupStyles}>
                  <label style={labelStyles}>Assigned To Resource</label>
                  <input
                    type="number"
                    value={formData.AssignedToResource || ''}
                    onChange={(e) => setFormData({...formData, AssignedToResource: e.target.value ? parseInt(e.target.value) : undefined})}
                    style={{...inputStyles, backgroundColor: '#f3f4f6', cursor: 'not-allowed'}}
                    disabled
                  />
                </div>
              </div>

              <div style={formGroupStyles}>
                <label style={labelStyles}>Client Evaluation</label>
                <select
                  value={formData.ClientEvaluation}
                  onChange={(e) => setFormData({...formData, ClientEvaluation: e.target.value})}
                  style={inputStyles}
                >
                  <option value="">Select Client Evaluation</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              {/* Skills Section */}
              <div style={formGroupStyles}>
                <label style={labelStyles}>Required Skills</label>
                
                {/* Selected Skills Display */}
                {selectedSkills.length > 0 && (
                  <div style={{ marginBottom: '15px' }}>
                    {selectedSkills.map((skill) => (
                      <div key={skill.SkillID} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        margin: '4px 0',
                        backgroundColor: skill.Mandatory ? '#fef3c7' : '#f3f4f6',
                        border: `1px solid ${skill.Mandatory ? '#fbbf24' : '#d1d5db'}`,
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}>
                        <span>
                          <strong>{skill.SkillName}</strong>
                          {skill.Mandatory && <span style={{ color: '#dc2626', marginLeft: '8px' }}>*Required</span>}
                          <span style={{ color: '#6b7280', marginLeft: '8px' }}>Level {skill.SkillLevel}</span>
                        </span>
                        <button 
                          type="button"
                          onClick={() => handleRemoveSkill(skill.SkillID)}
                          style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Existing Skill */}
                <div style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '600' }}>Add Existing Skill</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
                    <div>
                      <label style={{ ...labelStyles, fontSize: '12px' }}>Skill</label>
                      <select
                        value={selectedSkillId}
                        onChange={(e) => setSelectedSkillId(e.target.value)}
                        style={inputStyles}
                      >
                        <option value="">Select a skill...</option>
                        {availableSkills.map(skill => (
                          <option key={skill.SkillID} value={skill.SkillID}>
                            {skill.SkillName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ ...labelStyles, fontSize: '12px' }}>Level (1-5)</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={skillLevel}
                        onChange={(e) => setSkillLevel(parseInt(e.target.value) || 1)}
                        style={inputStyles}
                      />
                    </div>
                    <div>
                      <label style={{ ...labelStyles, fontSize: '12px', display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isMandatory}
                          onChange={(e) => setIsMandatory(e.target.checked)}
                          style={{ marginRight: '5px' }}
                        />
                        Required
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      disabled={!selectedSkillId}
                      style={{
                        ...submitButtonStyles,
                        padding: '8px 16px',
                        fontSize: '14px',
                        opacity: selectedSkillId ? 1 : 0.5,
                        cursor: selectedSkillId ? 'pointer' : 'not-allowed'
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Create New Skill */}
                <div style={{ padding: '15px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>Create New Skill</h4>
                    <button
                      type="button"
                      onClick={() => setShowNewSkillForm(!showNewSkillForm)}
                      style={{
                        background: 'transparent',
                        border: '1px solid #3b82f6',
                        color: '#3b82f6',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      {showNewSkillForm ? 'Cancel' : 'New Skill'}
                    </button>
                  </div>
                  
                  {showNewSkillForm && (
                    <div>
                      {skillError && (
                        <div style={{ color: '#dc2626', fontSize: '12px', marginBottom: '10px' }}>
                          {skillError}
                        </div>
                      )}
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
                        <div>
                          <label style={{ ...labelStyles, fontSize: '12px' }}>New Skill Name</label>
                          <input
                            type="text"
                            value={newSkillName}
                            onChange={(e) => setNewSkillName(e.target.value)}
                            style={inputStyles}
                            placeholder="Enter skill name..."
                          />
                        </div>
                        <div>
                          <label style={{ ...labelStyles, fontSize: '12px' }}>Level (1-5)</label>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            value={skillLevel}
                            onChange={(e) => setSkillLevel(parseInt(e.target.value) || 1)}
                            style={inputStyles}
                          />
                        </div>
                        <div>
                          <label style={{ ...labelStyles, fontSize: '12px', display: 'flex', alignItems: 'center' }}>
                            <input
                              type="checkbox"
                              checked={isMandatory}
                              onChange={(e) => setIsMandatory(e.target.checked)}
                              style={{ marginRight: '5px' }}
                            />
                            Required
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={handleCreateNewSkill}
                          disabled={!newSkillName.trim() || skillLoading}
                          style={{
                            ...submitButtonStyles,
                            padding: '8px 16px',
                            fontSize: '14px',
                            opacity: newSkillName.trim() && !skillLoading ? 1 : 0.5,
                            cursor: newSkillName.trim() && !skillLoading ? 'pointer' : 'not-allowed'
                          }}
                        >
                          {skillLoading ? 'Creating...' : 'Create & Add'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div style={formActionsStyles}>
                <button type="button" onClick={handleCancel} style={cancelButtonStyles}>
                  Cancel
                </button>
                <button type="submit" style={submitButtonStyles}>
                  {editingOrder ? 'Update Service Order' : 'Create Service Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={tableContainerStyles}>
        <table style={tableStyles}>
          <thead>
            <tr style={tableHeaderRowStyles}>
              <th style={tableHeaderStyles}>ID</th>
              <th style={tableHeaderStyles}>Account</th>
              <th style={tableHeaderStyles}>Role</th>
              <th style={tableHeaderStyles}>Location</th>
              <th style={tableHeaderStyles}>Grade</th>
              <th style={tableHeaderStyles}>Hiring Manager</th>
              <th style={tableHeaderStyles}>Status</th>
              <th style={tableHeaderStyles}>Skills</th>
              <th style={tableHeaderStyles}>Required From</th>
              <th style={tableHeaderStyles}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {serviceOrders.map((order) => (
              <tr key={order.ServiceOrderID} style={tableRowStyles}>
                <td style={tableCellStyles}>{order.ServiceOrderID}</td>
                <td style={tableCellStyles}>{order.AccountName}</td>
                <td style={tableCellStyles}>{order.CCARole}</td>
                <td style={tableCellStyles}>{order.Location}</td>
                <td style={tableCellStyles}>{order.Grade}</td>
                <td style={tableCellStyles}>{getSupervisorName(order.HiringManager)}</td>
                <td style={tableCellStyles}>
                  <span style={{
                    ...statusBadgeStyles,
                    backgroundColor: getStatusColor(order.SOState)
                  }}>
                    {order.SOState}
                  </span>
                </td>
                <td style={tableCellStyles}>
                  {order.skills && order.skills.length > 0 ? (
                    <div style={{ fontSize: '12px' }}>
                      {order.skills.slice(0, 2).map((skill, index) => (
                        <span key={skill.SkillID} style={{
                          display: 'inline-block',
                          backgroundColor: skill.Mandatory ? '#fef3c7' : '#f3f4f6',
                          color: skill.Mandatory ? '#92400e' : '#374151',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          margin: '1px',
                          fontSize: '11px'
                        }}>
                          {skill.SkillName} ({skill.SkillLevel})
                          {skill.Mandatory && '*'}
                        </span>
                      ))}
                      {order.skills.length > 2 && (
                        <span style={{ fontSize: '11px', color: '#6b7280' }}>
                          +{order.skills.length - 2} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <span style={{ color: '#9ca3af', fontSize: '12px' }}>No skills</span>
                  )}
                </td>
                <td style={tableCellStyles}>
                  {order.RequiredFrom ? new Date(order.RequiredFrom).toLocaleDateString() : 'N/A'}
                </td>
                <td style={tableCellStyles}>
                  <div style={actionsContainerStyles}>
                    <button 
                      onClick={() => handleEdit(order)} 
                      style={editButtonStyles}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => order.ServiceOrderID && handleDelete(order.ServiceOrderID)} 
                      style={deleteButtonStyles}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {serviceOrders.length === 0 && (
          <div style={emptyStateStyles}>
            <p>No service orders found. Create your first service order to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Styles
const containerStyles: React.CSSProperties = {
  padding: '2rem',
  maxWidth: '100%',
  margin: '0 auto'
};

const headerStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2rem'
};

const titleStyles: React.CSSProperties = {
  margin: '0',
  fontSize: '2rem',
  fontWeight: '600',
  color: '#1f2937'
};

const createButtonStyles: React.CSSProperties = {
  backgroundColor: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  padding: '0.75rem 1.5rem',
  fontSize: '1rem',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'background-color 0.2s'
};

const modalOverlayStyles: React.CSSProperties = {
  position: 'fixed',
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000
};

const modalStyles: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '12px',
  padding: '0',
  maxWidth: '800px',
  width: '90%',
  maxHeight: '90vh',
  overflow: 'auto'
};

const modalHeaderStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1.5rem',
  borderBottom: '1px solid #e5e7eb'
};

const closeButtonStyles: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: '1.5rem',
  cursor: 'pointer',
  color: '#6b7280'
};

const formStyles: React.CSSProperties = {
  padding: '1.5rem'
};

const formGridStyles: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '1rem',
  marginBottom: '1rem'
};

const formGroupStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem'
};

const labelStyles: React.CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: '500',
  color: '#374151'
};

const inputStyles: React.CSSProperties = {
  padding: '0.75rem',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '1rem'
};

const formActionsStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '1rem',
  marginTop: '2rem'
};

const cancelButtonStyles: React.CSSProperties = {
  padding: '0.75rem 1.5rem',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  backgroundColor: 'white',
  color: '#374151',
  cursor: 'pointer'
};

const submitButtonStyles: React.CSSProperties = {
  padding: '0.75rem 1.5rem',
  border: 'none',
  borderRadius: '6px',
  backgroundColor: '#3b82f6',
  color: 'white',
  cursor: 'pointer',
  fontWeight: '500'
};

const tableContainerStyles: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden'
};

const tableStyles: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse' as const
};

const tableHeaderRowStyles: React.CSSProperties = {
  backgroundColor: '#f9fafb'
};

const tableHeaderStyles: React.CSSProperties = {
  padding: '1rem',
  textAlign: 'left' as const,
  fontWeight: '600',
  color: '#374151',
  borderBottom: '1px solid #e5e7eb'
};

const tableRowStyles: React.CSSProperties = {
  borderBottom: '1px solid #e5e7eb'
};

const tableCellStyles: React.CSSProperties = {
  padding: '1rem',
  color: '#6b7280'
};

const statusBadgeStyles: React.CSSProperties = {
  padding: '0.25rem 0.75rem',
  borderRadius: '9999px',
  fontSize: '0.75rem',
  fontWeight: '500',
  color: 'white'
};

const actionsContainerStyles: React.CSSProperties = {
  display: 'flex',
  gap: '0.5rem'
};

const editButtonStyles: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '1.2rem',
  padding: '0.25rem'
};

const deleteButtonStyles: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '1.2rem',
  padding: '0.25rem'
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
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '400px',
  gap: '1rem',
  color: '#dc2626'
};

const retryButtonStyles: React.CSSProperties = {
  padding: '0.75rem 1.5rem',
  backgroundColor: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer'
};

const emptyStateStyles: React.CSSProperties = {
  padding: '3rem',
  textAlign: 'center' as const,
  color: '#6b7280'
};

export default ManageServiceOrders;
