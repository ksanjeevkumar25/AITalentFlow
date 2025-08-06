import logo from './logo.svg';
import './App.css';
import { useState, useRef, useEffect } from 'react';

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicrophoneOn, setIsMicrophoneOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [ratings, setRatings] = useState({
    technical: 0,
    communication: 0,
    problemSolving: 0
  });
  const [isRecording, setIsRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState([]);
  const [meetingLink, setMeetingLink] = useState('');
  const [linkGenerated, setLinkGenerated] = useState(false);
  const [candidateEmail, setCandidateEmail] = useState('');
  const [participants, setParticipants] = useState([]);
  const [scheduledInterviews, setScheduledInterviews] = useState([]);
  const [completedInterviews, setCompletedInterviews] = useState([]);
  const [isLoadingScheduled, setIsLoadingScheduled] = useState(true);
  const [isLoadingCompleted, setIsLoadingCompleted] = useState(true);
  const [scheduledError, setScheduledError] = useState(null);
  const [completedError, setCompletedError] = useState(null);
  const [lastUpdatedScheduled, setLastUpdatedScheduled] = useState(null);
  const [lastUpdatedCompleted, setLastUpdatedCompleted] = useState(null);
  const [candidatesForEvaluation, setCandidatesForEvaluation] = useState([]);
  const [isLoadingEvaluation, setIsLoadingEvaluation] = useState(false);
  const [evaluationError, setEvaluationError] = useState(null);
  const [lastUpdatedEvaluation, setLastUpdatedEvaluation] = useState(null);
  const [selectedCandidateForEvaluation, setSelectedCandidateForEvaluation] = useState(null);
  const [evaluationRatings, setEvaluationRatings] = useState({
    technical: 0,
    communication: 0,
    problemSolving: 0,
    culturalFit: 0,
    leadership: 0
  });
  const [evaluationNotes, setEvaluationNotes] = useState('');
  const [evaluationDecision, setEvaluationDecision] = useState('');
  const [TranscriptLLMResponse, setTranscriptLLMResponse] = useState('');
  const [showQuestionAnswersPopup, setShowQuestionAnswersPopup] = useState(false);
  const [popupTranscriptData, setPopupTranscriptData] = useState('');
  const [newInterviewData, setNewInterviewData] = useState({
    candidateName: '',
    candidateEmployeeId: '',
    emailId: '',
    position: '',
    interviewType: '',
    interviewer: '',
    serviceOrderId: 301,
    accountName: 'GlobalCorp Inc.',
    date: '',
    time: '',
    notes: ''
  });
  const [currentInterviewDetails, setCurrentInterviewDetails] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [employeesError, setEmployeesError] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const [candidatesError, setCandidatesError] = useState(null);
  const [serviceOrders, setServiceOrders] = useState([]);
  const [isLoadingServiceOrders, setIsLoadingServiceOrders] = useState(false);
  const [serviceOrdersError, setServiceOrdersError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  // API Configuration
  // Set REACT_APP_API_URL in your .env file for your actual API endpoint
  // Example: REACT_APP_API_URL=http://your-api-domain.com
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://api.interviewportal.com';

  // Update evaluation schedule status API
  const updateEvaluationScheduleStatus = async (serviceOrderId, employeeId, updateData) => {
    try {
      console.log('🔄 Updating evaluation schedule status...', { serviceOrderId, employeeId, updateData });
      
      const response = await fetch(`${API_BASE_URL}/updateEvaluationScheduleStatus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ServiceOrderID: serviceOrderId,
          EmployeeID: employeeId,
          ...updateData
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Evaluation schedule status updated successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error updating evaluation schedule status:', error);
      throw error;
    }
  };

  // Get question answers API
  const getQuestionAnswers = async (audioText) => {
    try {
      console.log('🎯 Getting question answers from audio text...', { audioText });
      
      const response = await fetch(`${API_BASE_URL}/getQuestionAnswers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioText: audioText
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Question answers retrieved successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error getting question answers:', error);
      throw error;
    }
  };

  // Get evaluation schedule status API
  const getEvaluationScheduleStatus = async (serviceOrderId, employeeId) => {
    try {
      console.log('📊 Getting evaluation schedule status...', { serviceOrderId, employeeId });
      
      const response = await fetch(`${API_BASE_URL}/getEvaluationScheduleStatus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ServiceOrderID: serviceOrderId,
          EmployeeID: employeeId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Evaluation schedule status retrieved successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error getting evaluation schedule status:', error);
      throw error;
    }
  };

  // Fetch scheduled interviews from API
  const fetchScheduledInterviews = async () => {
    try {
      console.log('🔍 Starting fetchScheduledInterviews...');
      setIsLoadingScheduled(true);
      setScheduledError(null);
      
      const response = await fetch('http://localhost:8000/evaluationSchedules', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 API Response status:', response.status);
      console.log('📡 API Response ok:', response.ok);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        if (response.status === 405) {
          errorMessage = 'Method Not Allowed - The /evaluationSchedules endpoint might not support GET requests';
        } else if (response.status === 404) {
          errorMessage = 'Endpoint not found - Check if /evaluationSchedules exists on the API server';
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('📋 Raw API data received:', data);
      console.log('📋 API data type:', typeof data);
      console.log('📋 Is API data an array?', Array.isArray(data));
      
      const processedData = Array.isArray(data) ? data : data.evaluationSchedules || data.interviews || data.data || [];
      console.log('📋 Processed data:', processedData);
      console.log('📋 Processed data length:', processedData.length);
      
      setScheduledInterviews(processedData);
      setLastUpdatedScheduled(new Date());
      console.log('✅ Successfully fetched scheduled interviews from /evaluationSchedules');
      
    } catch (error) {
      console.error('❌ Error fetching scheduled interviews from /evaluationSchedules:', error);
      
      // More detailed error message
      let detailedError = error.message;
      if (error.message.includes('Failed to fetch')) {
        detailedError = 'Cannot connect to API server. Is the server running on http://localhost:8000?';
      }
      
      setScheduledError(detailedError);
      
      // Fallback to mock data for demo purposes
      const mockData = [
        {
          id: 1,
          employeeId: 'EMP001',
          employeeName: 'John Smith',
          interviewerId: 'INT101',
          interviewerName: 'Jane Wilson',
          evaluationDateTime: '2024-01-20 10:00 AM',
          evaluationType: 'Technical Interview',
          status: 'Confirmed'
        },
        {
          id: 2,
          employeeId: 'EMP002', 
          employeeName: 'Sarah Johnson',
          interviewerId: 'INT102',
          interviewerName: 'Mike Chen',
          evaluationDateTime: '2024-01-22 2:30 PM',
          evaluationType: 'System Design',
          status: 'Pending'
        }
      ];
      
      console.log('📋 Setting fallback mock data:', mockData);
      console.log('📋 Mock data length:', mockData.length);
      
      setScheduledInterviews(mockData);
      setLastUpdatedScheduled(new Date());
    } finally {
      setIsLoadingScheduled(false);
    }
  };

  // Fetch completed interviews from API
  const fetchCompletedInterviews = async () => {
    try {
      console.log('🔍 Starting fetchCompletedInterviews...');
      setIsLoadingCompleted(true);
      setCompletedError(null);
      
      const response = await fetch('http://localhost:8000/completedInterviews', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Completed Interviews API Response status:', response.status);
      console.log('📡 Completed Interviews API Response ok:', response.ok);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        if (response.status === 405) {
          errorMessage = 'Method Not Allowed - The /completedInterviews endpoint might not support GET requests';
        } else if (response.status === 404) {
          errorMessage = 'Endpoint not found - Check if /completedInterviews exists on the API server';
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('📋 Raw Completed Interviews API data received:', data);
      console.log('📋 Completed Interviews API data type:', typeof data);
      console.log('📋 Is Completed Interviews API data an array?', Array.isArray(data));
      
      const processedData = Array.isArray(data) ? data : data.completedInterviews || data.interviews || data.data || [];
      console.log('📋 Processed completed interviews data:', processedData);
      console.log('📋 Processed completed interviews data length:', processedData.length);
      
      setCompletedInterviews(processedData);
      setLastUpdatedCompleted(new Date());
      console.log('✅ Successfully fetched completed interviews from /completedInterviews');
    } catch (error) {
      console.error('❌ Error fetching completed interviews from /completedInterviews:', error);
      
      // More detailed error message
      let detailedError = error.message;
      if (error.message.includes('Failed to fetch')) {
        detailedError = 'Cannot connect to API server. Is the server running on http://localhost:8000?';
      }
      
      setCompletedError(detailedError);
      
      // Fallback to mock data for demo purposes
      const mockData = [
        {
          id: 1,
          candidateName: 'Emily Davis',
          position: 'Backend Developer',
          date: '2024-01-15',
          time: '3:00 PM',
          interviewType: 'Technical Interview',
          duration: '45 min',
          rating: 4.2,
          status: 'Hired'
        },
        {
          id: 2,
          candidateName: 'Alex Rodriguez',
          position: 'Product Manager',
          date: '2024-01-18',
          time: '1:00 PM',
          interviewType: 'Behavioral Interview',
          duration: '60 min',
          rating: 3.8,
          status: 'Under Review'
        }
      ];
      
      console.log('📋 Setting fallback completed interviews mock data:', mockData);
      console.log('📋 Completed interviews mock data length:', mockData.length);
      
      setCompletedInterviews(mockData);
      setLastUpdatedCompleted(new Date());
    } finally {
      setIsLoadingCompleted(false);
    }
  };

  // Fetch candidates for evaluation from API
  const fetchCandidatesForEvaluation = async () => {
    try {
      console.log('🔍 Starting fetchCandidatesForEvaluation...');
      setIsLoadingEvaluation(true);
      setEvaluationError(null);
      
      const response = await fetch('http://localhost:8000/pendingEvaluations', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Pending Evaluations API Response status:', response.status);
      console.log('📡 Pending Evaluations API Response ok:', response.ok);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        if (response.status === 405) {
          errorMessage = 'Method Not Allowed - The /pendingEvaluations endpoint might not support GET requests';
        } else if (response.status === 404) {
          errorMessage = 'Endpoint not found - Check if /pendingEvaluations exists on the API server';
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('📋 Raw Pending Evaluations API data received:', data);
      console.log('📋 Pending Evaluations API data type:', typeof data);
      console.log('📋 Is Pending Evaluations API data an array?', Array.isArray(data));
      
      const processedData = Array.isArray(data) ? data : data.pendingEvaluations || data.candidates || data.data || [];
      console.log('📋 Processed pending evaluations data:', processedData);
      console.log('📋 Processed pending evaluations data length:', processedData.length);
      
      setCandidatesForEvaluation(processedData);
      setLastUpdatedEvaluation(new Date());
      console.log('✅ Successfully fetched pending evaluations from /pendingEvaluations');
    } catch (error) {
      console.error('❌ Error fetching pending evaluations from /pendingEvaluations:', error);
      
      // More detailed error message
      let detailedError = error.message;
      if (error.message.includes('Failed to fetch')) {
        detailedError = 'Cannot connect to API server. Is the server running on http://localhost:8000?';
      }
      
      setEvaluationError(detailedError);
      
      // Fallback to mock data for demo purposes
      const mockData = [
        {
          id: 1,
          candidateName: 'Robert Johnson',
          position: 'Senior Frontend Developer',
          interviewDate: '2024-01-19',
          interviewTime: '2:00 PM',
          interviewType: 'Technical Interview',
          interviewer: 'Jane Smith',
          duration: '60 min',
          status: 'Awaiting Evaluation',
          interviewNotes: 'Candidate showed strong technical skills in React and JavaScript. Good communication and problem-solving approach.',
          urgency: 'High'
        },
        {
          id: 2,
          candidateName: 'Maria Garcia',
          position: 'Full Stack Developer',
          interviewDate: '2024-01-18',
          interviewTime: '11:30 AM',
          interviewType: 'System Design',
          interviewer: 'Tom Wilson',
          duration: '90 min',
          status: 'Awaiting Evaluation',
          interviewNotes: 'Excellent system design skills. Proposed scalable architecture for the given problem.',
          urgency: 'Medium'
        },
        {
          id: 3,
          candidateName: 'David Chen',
          position: 'Backend Developer',
          interviewDate: '2024-01-17',
          interviewTime: '4:15 PM',
          interviewType: 'Coding Challenge',
          interviewer: 'Sarah Lee',
          duration: '75 min',
          status: 'Awaiting Evaluation',
          interviewNotes: 'Solid coding skills, clean code structure. Completed the challenge within time limit.',
          urgency: 'Low'
        },
        {
          id: 4,
          candidateName: 'Lisa Wang',
          position: 'DevOps Engineer',
          interviewDate: '2024-01-16',
          interviewTime: '10:00 AM',
          interviewType: 'Technical Interview',
          interviewer: 'Mike Johnson',
          duration: '45 min',
          status: 'Awaiting Evaluation',
          interviewNotes: 'Strong knowledge of CI/CD pipelines and cloud infrastructure. Good troubleshooting skills.',
          urgency: 'High'
        }
      ];
      
      console.log('📋 Setting fallback pending evaluations mock data:', mockData);
      console.log('📋 Pending evaluations mock data length:', mockData.length);
      
      setCandidatesForEvaluation(mockData);
      setLastUpdatedEvaluation(new Date());
    } finally {
      setIsLoadingEvaluation(false);
    }
  };

  // Fetch employees from API
  const fetchEmployees = async () => {
    try {
      setIsLoadingEmployees(true);
      setEmployeesError(null);
      
      // Try different possible endpoints/methods
      let response;
      const possibleEndpoints = [
        { url: 'http://localhost:8000/employees', method: 'GET' },
        { url: 'http://localhost:8000/api/employees', method: 'GET' },
        { url: 'http://localhost:8000/employees', method: 'POST' },
        { url: 'http://localhost:8000/api/employees', method: 'POST' }
      ];
      
      let lastError;
      for (const endpoint of possibleEndpoints) {
        try {
          response = await fetch(endpoint.url, {
            method: endpoint.method,
            headers: {
              'Content-Type': 'application/json',
            },
            ...(endpoint.method === 'POST' && { body: JSON.stringify({}) })
          });
          
          if (response.ok) {
            console.log(`✅ Successfully connected to: ${endpoint.method} ${endpoint.url}`);
            break;
          } else {
            lastError = `${endpoint.method} ${endpoint.url}: ${response.status}`;
          }
        } catch (err) {
          lastError = `${endpoint.method} ${endpoint.url}: ${err.message}`;
          continue;
        }
      }

      if (!response || !response.ok) {
        let errorMessage = lastError || 'All endpoints failed';
        if (response && response.status === 405) {
          errorMessage = 'Method Not Allowed - None of the common endpoints/methods worked. Check your API documentation.';
        } else if (response && response.status === 404) {
          errorMessage = 'Endpoint not found - Check if the API server is running and the URL is correct';
        } else if (!response) {
          errorMessage = `All API endpoints failed. Last error: ${lastError}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setEmployees(Array.isArray(data) ? data : data.employees || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      
      // More detailed error message
      let detailedError = error.message;
      if (error.message.includes('Failed to fetch')) {
        detailedError = 'Cannot connect to API server. Is the server running on http://localhost:8000?';
      }
      
      setEmployeesError(detailedError);
      
      // Fallback to mock data for demo purposes
      setEmployees([
        { employee_id: 1, first_name: 'Jane', last_name: 'Smith', emailId: 'jane.smith@company.com', department: 'Engineering', role: 'Senior Developer' },
        { employee_id: 2, first_name: 'Tom', last_name: 'Wilson', emailId: 'tom.wilson@company.com', department: 'Engineering', role: 'Tech Lead' },
        { employee_id: 3, first_name: 'Sarah', last_name: 'Lee', emailId: 'sarah.lee@company.com', department: 'Engineering', role: 'Full Stack Developer' },
        { employee_id: 4, first_name: 'Mike', last_name: 'Johnson', emailId: 'mike.johnson@company.com', department: 'DevOps', role: 'DevOps Engineer' },
        { employee_id: 5, first_name: 'Emily', last_name: 'Davis', emailId: 'emily.davis@company.com', department: 'Product', role: 'Product Manager' },
        { employee_id: 6, first_name: 'Alex', last_name: 'Rodriguez', emailId: 'alex.rodriguez@company.com', department: 'HR', role: 'HR Representative' }
      ]);
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  // Fetch candidates from API
  const fetchCandidates = async () => {
    try {
      setIsLoadingCandidates(true);
      setCandidatesError(null);
      
      const response = await fetch('http://localhost:8000/candidateToSchedule', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        if (response.status === 405) {
          errorMessage = 'Method Not Allowed - The /candidateToSchedule endpoint might not support GET requests';
        } else if (response.status === 404) {
          errorMessage = 'Endpoint not found - Check if /candidateToSchedule exists on the API server';
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setCandidates(Array.isArray(data) ? data : data.candidates || data.data || []);
      console.log('✅ Successfully fetched candidates from /candidateToSchedule');
    } catch (error) {
      console.error('Error fetching candidates from /candidateToSchedule:', error);
      
      // More detailed error message
      let detailedError = error.message;
      if (error.message.includes('Failed to fetch')) {
        detailedError = 'Cannot connect to API server. Is the server running on http://localhost:8000?';
      }
      
      setCandidatesError(detailedError);
      
      // Fallback to mock data for demo purposes
      setCandidates([
        { employee_id: 101, first_name: 'John', last_name: 'Smith', emailId: 'john.smith@email.com', phone: '+1-555-0101' },
        { employee_id: 102, first_name: 'Sarah', last_name: 'Johnson', emailId: 'sarah.johnson@email.com', phone: '+1-555-0102' },
        { employee_id: 103, first_name: 'Mike', last_name: 'Chen', emailId: 'mike.chen@email.com', phone: '+1-555-0103' },
        { employee_id: 104, first_name: 'Emily', last_name: 'Davis', emailId: 'emily.davis@email.com', phone: '+1-555-0104' },
        { employee_id: 105, first_name: 'Alex', last_name: 'Rodriguez', emailId: 'alex.rodriguez@email.com', phone: '+1-555-0105' },
        { employee_id: 106, first_name: 'Lisa', last_name: 'Wang', emailId: 'lisa.wang@email.com', phone: '+1-555-0106' },
        { employee_id: 107, first_name: 'David', last_name: 'Brown', emailId: 'david.brown@email.com', phone: '+1-555-0107' },
        { employee_id: 108, first_name: 'Maria', last_name: 'Garcia', emailId: 'maria.garcia@email.com', phone: '+1-555-0108' }
      ]);
    } finally {
      setIsLoadingCandidates(false);
    }
  };

  // Fetch service orders from API
  const fetchServiceOrders = async () => {
    try {
      setIsLoadingServiceOrders(true);
      setServiceOrdersError(null);
      
      const response = await fetch('http://localhost:8000/serviceorders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        if (response.status === 405) {
          errorMessage = 'Method Not Allowed - The /serviceorders endpoint might not support GET requests';
        } else if (response.status === 404) {
          errorMessage = 'Endpoint not found - Check if /serviceorders exists on the API server';
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setServiceOrders(Array.isArray(data) ? data : data.serviceOrders || data.data || []);
      console.log('✅ Successfully fetched service orders from /serviceorders');
    } catch (error) {
      console.error('Error fetching service orders from /serviceorders:', error);
      
      // More detailed error message
      let detailedError = error.message;
      if (error.message.includes('Failed to fetch')) {
        detailedError = 'Cannot connect to API server. Is the server running on http://localhost:8000?';
      }
      
      setServiceOrdersError(detailedError);
      
      // Fallback to mock data for demo purposes
      setServiceOrders([
        { id: 301, serviceOrderId: 301, accountName: 'GlobalCorp Inc.' },
        { id: 'SO-001', serviceOrderId: 'SO-001', accountName: 'ABC Corporation' },
        { id: 'SO-002', serviceOrderId: 'SO-002', accountName: 'XYZ Industries' },
        { id: 'SO-003', serviceOrderId: 'SO-003', accountName: 'TechCorp Solutions' },
        { id: 'SO-004', serviceOrderId: 'SO-004', accountName: 'Global Enterprises' },
        { id: 'SO-005', serviceOrderId: 'SO-005', accountName: 'Innovation Labs' }
      ]);
    } finally {
      setIsLoadingServiceOrders(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchScheduledInterviews();
    fetchCompletedInterviews();
  }, []);

  // Debug effect to track scheduledInterviews state changes
  useEffect(() => {
    console.log('🔄 scheduledInterviews state changed:', scheduledInterviews);
    console.log('🔄 scheduledInterviews length:', scheduledInterviews.length);
  }, [scheduledInterviews]);

  // Debug effect to track completedInterviews state changes
  useEffect(() => {
    console.log('🔄 completedInterviews state changed:', completedInterviews);
    console.log('🔄 completedInterviews length:', completedInterviews.length);
  }, [completedInterviews]);

  // Debug effect to track currentInterviewDetails state changes
  useEffect(() => {
    console.log('🎬 currentInterviewDetails state changed:', currentInterviewDetails);
  }, [currentInterviewDetails]);

  // Fetch evaluation data when switching to evaluation section
  useEffect(() => {
    if (activeSection === 'evaluation') {
      fetchCandidatesForEvaluation();
    }
  }, [activeSection]);

  const addParticipant = (name, role, isHost = false) => {
    const newParticipant = {
      id: Date.now() + Math.random(),
      name,
      role,
      isHost,
      joinedAt: new Date().toLocaleTimeString(),
      camera: true,
      microphone: true
    };
    setParticipants(prev => [...prev, newParticipant]);
  };

  const simulateCandidateJoin = () => {
    addParticipant('Candidate', 'Candidate', false);
  };

  const addRandomParticipant = () => {
    const names = ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Emily Davis', 'Alex Rodriguez'];
    const roles = ['Interviewer', 'Observer', 'Technical Lead', 'HR Representative'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomRole = roles[Math.floor(Math.random() * roles.length)];
    addParticipant(randomName, randomRole, false);
  };

  const startInterview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Start audio recording
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      setAudioChunks([]);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(prev => [...prev, event.data]);
        }
      };
      
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      
      // Add interviewer as first participant
      addParticipant('Interviewer (You)', 'Host', true);
      
      // Simulate candidate joining after 2 seconds
      setTimeout(() => {
        simulateCandidateJoin();
      }, 2000);
      
      setIsInterviewStarted(true);
      setIsCameraOn(true);
      setIsMicrophoneOn(true);
      setIsAudioOn(true);
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Unable to access camera/microphone. Please check permissions.');
    }
  };

  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isCameraOn;
        setIsCameraOn(!isCameraOn);
      }
    }
  };

  const toggleMicrophone = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isMicrophoneOn;
        setIsMicrophoneOn(!isMicrophoneOn);
      }
    }
  };

  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn);
  };

  const processAudioTranscription = async (audioBlob) => {
    // Placeholder function for audio transcription
    // In a real implementation, you would send the audioBlob to a speech-to-text service
    // such as Google Speech-to-Text, Azure Speech Services, or OpenAI Whisper
    
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return placeholder transcript text
      return "Sample interview transcript: Candidate discussed their technical experience, problem-solving approach, and career goals. The interview covered various topics including software development, teamwork, and project management.";
    } catch (error) {
      throw new Error('Failed to process audio transcription');
    }
  };

  const saveAudioRecording = (chunks) => {
    if (chunks.length === 0) return;
    
    const audioBlob = new Blob(chunks, { type: 'audio/webm' });
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // Create download link
    const downloadLink = document.createElement('a');
    downloadLink.href = audioUrl;
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    downloadLink.download = `interview-recording-${timestamp}.webm`;
    
    // Trigger download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Cleanup
    URL.revokeObjectURL(audioUrl);
    
    console.log('Audio recording saved successfully');
  };

  const stopInterview = () => {
    // Stop audio recording
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = async () => {
        // Capture audio text for transcription
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        
        // Process audio transcription (placeholder for actual implementation)
        try {
          // This is where you would integrate with a speech-to-text service
          // For now, setting a placeholder response
          const audioText = await processAudioTranscription(audioBlob);
          console.log('Audio transcript captured:', audioText);
          
          // Call getQuestionAnswers API with audioText
          try {
            const questionAnswersResult = await getQuestionAnswers(audioText);
            console.log('Question answers obtained:', questionAnswersResult);
            setTranscriptLLMResponse(questionAnswersResult);
          } catch (questionAnswersError) {
            console.error('Error getting question answers:', questionAnswersError);
            setTranscriptLLMResponse('Error: Unable to get question answers');
          }
        } catch (error) {
          console.error('Error processing audio transcription:', error);
          setTranscriptLLMResponse('Error: Unable to process audio transcription');
        }
        
        saveAudioRecording(audioChunks);
        setAudioChunks([]);
      };
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    
    // Stop video/audio stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsInterviewStarted(false);
    setIsCameraOn(false);
    setIsMicrophoneOn(false);
    setIsAudioOn(false);
    setParticipants([]);
    
    // Call updateEvaluationScheduleStatus API
    if (currentInterviewDetails) {
      const serviceOrderId = currentInterviewDetails.serviceOrderId || currentInterviewDetails.serviceOrderID || 301; // Default fallback
      const employeeId = currentInterviewDetails.employeeId || currentInterviewDetails.EmployeeID;
      
      if (employeeId) {
        try {
          // Prepare the data for API call
          const updateData = {
            EvaluationTranscription: TranscriptLLMResponse || 'No transcript available',
            AudioRecording: audioChunks.length > 0 ? 'Audio recording available' : 'No audio recording',
            VideoRecording: 'Video recording available', // Placeholder - would contain actual video data
            TranscriptLLMResponse: TranscriptLLMResponse || ''
          };
          
          // Call the API
          updateEvaluationScheduleStatus(serviceOrderId, employeeId, updateData)
            .then(result => {
              console.log('📝 Evaluation schedule updated successfully');
            })
            .catch(error => {
              console.error('❌ Failed to update evaluation schedule:', error);
            });
        } catch (error) {
          console.error('❌ Error preparing evaluation schedule update:', error);
        }
      } else {
        console.warn('⚠️ No employee ID found in current interview details');
      }
    } else {
      console.warn('⚠️ No current interview details available for API update');
    }
    
    // Clear interview details when stopping interview
    setCurrentInterviewDetails(null);
  };

  const setRating = (category, rating) => {
    setRatings(prev => ({
      ...prev,
      [category]: rating
    }));
  };

  const setEvaluationRating = (category, rating) => {
    setEvaluationRatings(prev => ({
      ...prev,
      [category]: rating
    }));
  };

  const selectCandidateForEvaluation = (candidate) => {
    setSelectedCandidateForEvaluation(candidate);
    // Reset evaluation form
    setEvaluationRatings({
      technical: 0,
      communication: 0,
      problemSolving: 0,
      culturalFit: 0,
      leadership: 0
    });
    setEvaluationNotes('');
    setEvaluationDecision('');
  };

  const handleQuestionAnswersClick = async (candidate) => {
    try {
      // Extract ServiceOrderID and EmployeeID from candidate data
      const serviceOrderId = candidate.serviceOrderId || candidate.serviceOrderID || 301; // Default fallback
      const employeeId = candidate.employeeId || candidate.candidateEmployeeId || candidate.id;
      
      if (!employeeId) {
        alert('Employee ID not found for this candidate');
        return;
      }

      // Call getEvaluationScheduleStatus API
      const result = await getEvaluationScheduleStatus(serviceOrderId, employeeId);
      
      // Extract transcriptLLMResponse from the result
      const transcriptData = result.transcriptLLMResponse || result.TranscriptLLMResponse || 'No transcript data available';
      
      // Set the data and show popup
      setPopupTranscriptData(transcriptData);
      setShowQuestionAnswersPopup(true);
      
    } catch (error) {
      console.error('Error fetching question answers:', error);
      alert('Failed to fetch question answers. Please try again.');
    }
  };

  const closeEvaluationDetail = () => {
    setSelectedCandidateForEvaluation(null);
  };

  const submitEvaluation = async (decision) => {
    setEvaluationDecision(decision);
    
    // Prepare evaluation data
    const evaluationData = {
      candidateId: selectedCandidateForEvaluation.id,
      ratings: evaluationRatings,
      notes: evaluationNotes,
      decision: decision
    };
    
    console.log('Submitting evaluation:', evaluationData);
    
    // Call updateEvaluationScheduleStatus API
    if (selectedCandidateForEvaluation) {
      const serviceOrderId = selectedCandidateForEvaluation.serviceOrderId || selectedCandidateForEvaluation.serviceOrderID || 301; // Default fallback
      const employeeId = selectedCandidateForEvaluation.employeeId || selectedCandidateForEvaluation.candidateEmployeeId || selectedCandidateForEvaluation.id;
      
      if (employeeId) {
        try {
          // Prepare the data for API call
          const updateData = {
            FinalStatus: decision,
            EvaluationFeedback: evaluationNotes || `Evaluation completed with ${decision} decision. Ratings: Technical: ${evaluationRatings.technical}/5, Communication: ${evaluationRatings.communication}/5, Problem Solving: ${evaluationRatings.problemSolving}/5, Cultural Fit: ${evaluationRatings.culturalFit}/5, Leadership: ${evaluationRatings.leadership}/5`
          };
          
          // Call the API
          await updateEvaluationScheduleStatus(serviceOrderId, employeeId, updateData);
          console.log('🎯 Evaluation schedule status updated successfully');
          
        } catch (error) {
          console.error('❌ Failed to update evaluation schedule status:', error);
          alert('Warning: Evaluation submitted locally but failed to update server status.');
        }
      } else {
        console.warn('⚠️ No employee ID found for evaluation status update');
      }
    }
    
    // Remove candidate from pending list and close detail view
    setCandidatesForEvaluation(prev => 
      prev.filter(c => c.id !== selectedCandidateForEvaluation.id)
    );
    setSelectedCandidateForEvaluation(null);
    
    alert(`Candidate ${decision.toLowerCase()}! Evaluation submitted successfully.`);
  };

  const openScheduleInterview = () => {
    setActiveSection('schedule-interview');
    // Reset form data
    setNewInterviewData({
      candidateName: '',
      candidateEmployeeId: '',
      emailId: '',
      position: '',
      interviewType: '',
      interviewer: '',
      serviceOrderId: 301,
      accountName: 'GlobalCorp Inc.',
      date: '',
      time: '',
      notes: ''
    });
    // Reset meeting invite state
    setMeetingLink('');
    setLinkGenerated(false);
    // Fetch data for dropdowns
    fetchEmployees();
    fetchCandidates();
    fetchServiceOrders();
  };

  const startScheduledInterview = (interview) => {
    console.log('🎬 Starting scheduled interview:', interview);
    // Set the current interview details
    setCurrentInterviewDetails(interview);
    // Navigate to live interview page
    setActiveSection('live-interview');
  };

  const handleScheduleInputChange = (field, value) => {
    setNewInterviewData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCandidateSelection = (candidateEmployeeId) => {
    // Find the selected candidate by employee_id to get their details
    const selectedCandidate = employees.find(candidate => candidate.employee_id.toString() === candidateEmployeeId.toString());
    
    if (selectedCandidate && candidateEmployeeId) {
      const fullName = `${selectedCandidate.first_name} ${selectedCandidate.last_name}`;
      setNewInterviewData(prev => ({
        ...prev,
        candidateEmployeeId: candidateEmployeeId,
        candidateName: fullName,
        emailId: selectedCandidate.emailId || ''
      }));
    } else {
      // Reset if no candidate found or empty selection
      setNewInterviewData(prev => ({
        ...prev,
        candidateEmployeeId: '',
        candidateName: '',
        emailId: ''
      }));
    }
  };

  const handleServiceOrderSelection = (serviceOrderId) => {
    // Find the selected service order to get the account name
    const selectedServiceOrder = serviceOrders.find(order => order.serviceOrderId.toString() === serviceOrderId.toString());
    
    setNewInterviewData(prev => ({
      ...prev,
      serviceOrderId: serviceOrderId,
      accountName: selectedServiceOrder ? selectedServiceOrder.accountName : ''
    }));
  };

  const submitScheduleInterview = async () => {
    // Validate required fields
    if (!newInterviewData.candidateEmployeeId || 
        !newInterviewData.position || !newInterviewData.interviewType || 
        !newInterviewData.interviewer || 
        !newInterviewData.date || !newInterviewData.time) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      // Find the selected candidate and interviewer to get their employee IDs
      const selectedCandidate = employees.find(emp => 
        emp.employee_id.toString() === newInterviewData.candidateEmployeeId.toString()
      );
      const selectedInterviewer = employees.find(emp => 
        emp.employee_id.toString() === newInterviewData.interviewer.toString()
      );

      if (!selectedCandidate || !selectedInterviewer) {
        alert('Error: Could not find candidate or interviewer details. Please try again.');
        return;
      }

      // Prepare API payload
      const payload = {
        service_order_id: newInterviewData.serviceOrderId ? newInterviewData.serviceOrderId.toString() : "",
        employee_id: selectedCandidate.employee_id.toString(),
        cognizant_evaluator_id: selectedInterviewer.employee_id.toString(),
        evaluation_datetime: `${newInterviewData.date} ${newInterviewData.time}`,
        evaluation_type: newInterviewData.interviewType || ""
      };

      console.log('Submitting interview to /evaluations API:', payload);

      // Call the /evaluations API
      const response = await fetch('http://localhost:8000/evaluations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        if (response.status === 400) {
          const errorData = await response.json();
          errorMessage = errorData.message || 'Bad request - please check your input data';
        } else if (response.status === 405) {
          errorMessage = 'Method Not Allowed - The /evaluations endpoint might not support POST requests';
        } else if (response.status === 404) {
          errorMessage = 'Endpoint not found - Check if /evaluations exists on the API server';
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ Successfully saved interview to /evaluations:', result);

      // Add to scheduled interviews list (local state)
      const newInterview = {
        id: result.id || Date.now(),
        candidateName: newInterviewData.candidateName,
        position: newInterviewData.position,
        date: newInterviewData.date,
        time: newInterviewData.time,
        interviewType: newInterviewData.interviewType,
        interviewer: selectedInterviewer.first_name + ' ' + selectedInterviewer.last_name,
        serviceOrderId: newInterviewData.serviceOrderId,
        accountName: newInterviewData.accountName,
        status: 'Confirmed',
        meetingLink: meetingLink || null,
        candidateEmail: newInterviewData.emailId
      };
      
      setScheduledInterviews(prev => [...prev, newInterview]);
      
      // Reset form and go back to dashboard
      setNewInterviewData({
        candidateName: '',
        candidateEmployeeId: '',
        emailId: '',
        position: '',
        interviewType: '',
        interviewer: '',
        serviceOrderId: 301,
        accountName: 'GlobalCorp Inc.',
        date: '',
        time: '',
        notes: ''
      });
      
      // Reset meeting invite state
      setMeetingLink('');
      setLinkGenerated(false);
      
      setActiveSection('dashboard');
      alert('Interview scheduled and saved successfully!');

    } catch (error) {
      console.error('Error saving interview to /evaluations API:', error);
      alert(`Failed to save interview: ${error.message}`);
    }
  };

  const generateMeetingInvite = () => {
    // Generate a unique meeting ID
    const meetingId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const baseUrl = window.location.origin;
    const inviteLink = `${baseUrl}/interview/${meetingId}`;
    
    setMeetingLink(inviteLink);
    setLinkGenerated(true);
  };

  const copyMeetingLink = async () => {
    try {
      await navigator.clipboard.writeText(meetingLink);
      alert('Meeting link copied to clipboard!');
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = meetingLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Meeting link copied to clipboard!');
    }
  };

  const shareMeetingViaEmail = () => {
    // Check if we're in schedule form or live interview
    const isScheduleForm = activeSection === 'schedule-interview';
    
    let candidateName, position, interviewType, emailAddress;
    
    if (isScheduleForm) {
      candidateName = newInterviewData.candidateName || 'Candidate';
      position = newInterviewData.position || 'Position';
      interviewType = newInterviewData.interviewType || 'Interview';
      emailAddress = newInterviewData.emailId;
    } else {
      candidateName = document.querySelector('input[placeholder="Enter candidate name"]')?.value || 'Candidate';
      position = document.querySelector('select')?.value || 'Position';
      interviewType = document.querySelectorAll('select')[1]?.value || 'Interview';
      emailAddress = candidateEmail;
    }
    
    // Check if email address is provided
    if (!emailAddress || emailAddress.trim() === '') {
      alert('Please select a candidate with an email address or enter an email address to send the invite.');
      return;
    }
    
    const subject = encodeURIComponent(`Interview Invitation - ${position}`);
    let emailBody = `Dear ${candidateName},

You are invited to participate in a ${interviewType} for the ${position} position.

Interview Details:
- Meeting Link: ${meetingLink}`;

    if (isScheduleForm && newInterviewData.date && newInterviewData.time) {
      emailBody += `
- Date: ${newInterviewData.date}
- Time: ${newInterviewData.time}`;
    }

    emailBody += `
- Please join the meeting at the scheduled time
- Ensure you have a stable internet connection and working camera/microphone

We look forward to speaking with you!

Best regards,
Interview Panel`;

    const body = encodeURIComponent(emailBody);
    const mailtoLink = `mailto:${emailAddress}?subject=${subject}&body=${body}`;
    window.open(mailtoLink);
  };

  const StarRating = ({ category, currentRating, onRatingChange, label }) => {
    const [hoveredRating, setHoveredRating] = useState(0);

    return (
      <div className="rating-item">
        <span>{label}:</span>
        <div className="rating-stars">
          {[1, 2, 3, 4, 5].map(star => (
            <span
              key={star}
              className={`star ${star <= (hoveredRating || currentRating) ? 'filled' : 'empty'}`}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => onRatingChange(category, star)}
            >
              {star <= (hoveredRating || currentRating) ? '⭐' : '☆'}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      {/* Header */}
      <header className="App-header">
                  <div className="header-content">
            <img src={logo} className="App-logo" alt="logo" />
            <h1>Interview Portal</h1>
                        <nav className="header-nav">
              <a href="#home" onClick={(e) => { e.preventDefault(); setActiveSection('dashboard'); }}>Home</a>
              <a href="#about">About</a>
              <a href="#contact">Contact</a>
            </nav>
        </div>
      </header>

      {/* Main Container */}
      <div className="main-container">
        {/* Left Panel */}
        <aside className="left-panel">
          <h3>Navigation</h3>
          <ul className="nav-menu">
            <li><a href="#live-interview" onClick={(e) => { e.preventDefault(); setActiveSection('live-interview'); }}>Live Interview</a></li>
            <li><a href="#evaluation" onClick={(e) => { e.preventDefault(); setActiveSection('evaluation'); }}>Evaluation</a></li>
          </ul>
        </aside>

        {/* Body/Main Content */}
        <main className="body-content">
          {activeSection === 'live-interview' ? (
            <div className="interview-page">
              <div className="content-header">
                <h2>Live Interview</h2>
                <p>Conduct real-time interviews with candidates</p>
                {currentInterviewDetails && (
                  <div className="interview-details-banner">
                    <div className="interview-banner-content">
                      <h3>📋 Current Interview</h3>
                      <div className="interview-banner-info">
                        <div className="candidate-info">
                          <span className="candidate-name">👤 {currentInterviewDetails.employeeName || currentInterviewDetails.candidateName}</span>
                          <span className="employee-id">ID: {currentInterviewDetails.employeeId}</span>
                        </div>
                        <div className="interview-meta-info">
                          <span className="interview-type">🎯 {currentInterviewDetails.evaluationType || currentInterviewDetails.interviewType}</span>
                          <span className="interview-time">📅 {currentInterviewDetails.evaluationDateTime || `${currentInterviewDetails.date} at ${currentInterviewDetails.time}`}</span>
                          <span className="interviewer">👤 Interviewer: {currentInterviewDetails.interviewerName || currentInterviewDetails.interviewer}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => setCurrentInterviewDetails(null)}
                      title="Clear interview details"
                    >
                      ✕ Clear
                    </button>
                  </div>
                )}
                {isRecording && (
                  <div className="recording-indicator">
                    <span className="recording-dot"></span>
                    <span>Recording Audio...</span>
                  </div>
                )}
              </div>
              
              <div className="interview-container">
                <div className="interview-controls">
                  <div className="interview-actions">
                    {!isInterviewStarted ? (
                      <button className="btn btn-primary" onClick={startInterview}>Start Interview</button>
                    ) : (
                      <button className="btn btn-danger" onClick={stopInterview}>Stop Interview</button>
                    )}
                  </div>
                </div>
                
                <div className="interview-workspace">
                  <div className="video-section">
                    {isInterviewStarted ? (
                      <div className="video-container">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          muted 
                          className="video-feed"
                        ></video>
                        
                        {/* Participants Panel */}
                        <div className="participants-panel">
                          <div className="participants-header">
                            <h5>👥 Participants ({participants.length})</h5>
                          </div>
                          <div className="participants-list">
                            {participants.map(participant => (
                              <div key={participant.id} className="participant-item">
                                <div className="participant-info">
                                  <div className="participant-name">
                                    {participant.isHost && <span className="host-badge">👑</span>}
                                    {participant.name}
                                  </div>
                                  <div className="participant-role">{participant.role}</div>
                                  <div className="participant-time">Joined: {participant.joinedAt}</div>
                                </div>
                                <div className="participant-controls">
                                  <span className={`control-icon ${participant.camera ? 'active' : 'inactive'}`}>
                                    📹
                                  </span>
                                  <span className={`control-icon ${participant.microphone ? 'active' : 'inactive'}`}>
                                    🎤
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="video-controls-overlay">
                          <button 
                            className={`video-btn ${isCameraOn ? 'active' : 'inactive'}`}
                            onClick={toggleCamera}
                          >
                            {isCameraOn ? '📹' : '📹❌'} Camera
                          </button>
                          <button 
                            className={`video-btn ${isMicrophoneOn ? 'active' : 'inactive'}`}
                            onClick={toggleMicrophone}
                          >
                            {isMicrophoneOn ? '🎤' : '🎤❌'} Microphone
                          </button>
                          <button 
                            className={`video-btn ${isAudioOn ? 'active' : 'inactive'}`}
                            onClick={toggleAudio}
                          >
                            {isAudioOn ? '🔊' : '🔇'} Audio
                          </button>
                          <button className="video-btn">📋 Share Screen</button>
                          <button 
                            className="video-btn"
                            onClick={addRandomParticipant}
                            title="Add test participant"
                          >
                            👤+ Add Participant
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="video-placeholder">
                        <div className="video-controls">
                          <button className="video-btn disabled">📹 Camera</button>
                          <button className="video-btn disabled">🎤 Microphone</button>
                          <button className="video-btn disabled">🔊 Audio</button>
                          <button className="video-btn disabled">📋 Share Screen</button>
                        </div>
                        <p>Click "Start Interview" to begin video call</p>
                      </div>
                    )}
                  </div>
                  
                  
                </div>
              </div>
            </div>
          ) : activeSection === 'evaluation' ? (
            <div className="evaluation-page">
              <div className="content-header">
                <h2>Candidate Evaluation</h2>
                <p>Review and evaluate candidates who have completed their interviews</p>
              </div>
              
              <div className="evaluation-content">
                <div className="interview-section">
                  <div className="section-header">
                    <div className="section-title">
                      <h3>📋 Pending Evaluations ({candidatesForEvaluation.length})</h3>
                      {lastUpdatedEvaluation && (
                        <p className="last-updated">
                          Last updated: {lastUpdatedEvaluation.toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                    <div className="section-actions">
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={fetchCandidatesForEvaluation}
                        disabled={isLoadingEvaluation}
                        title="Refresh data"
                      >
                        🔄 {isLoadingEvaluation ? 'Loading...' : 'Refresh'}
                      </button>
                      <button className="btn btn-secondary">View Completed</button>
                    </div>
                  </div>
                  
                  <div className="interview-list">
                    {isLoadingEvaluation ? (
                      <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading candidates for evaluation...</p>
                      </div>
                    ) : evaluationError ? (
                      <div className="error-state">
                        <div className="error-content">
                          <span className="error-icon">⚠️</span>
                          <div>
                            <p className="error-message">Failed to load candidates for evaluation</p>
                            <p className="error-details">{evaluationError}</p>
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={fetchCandidatesForEvaluation}
                            >
                              🔄 Retry
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : candidatesForEvaluation.length > 0 ? (
                      candidatesForEvaluation.map(candidate => (
                        <div key={candidate.id} className="interview-item evaluation clickable" onClick={() => selectCandidateForEvaluation(candidate)}>
                          <div className="interview-info">
                            <div className="candidate-details">
                              <h4>{candidate.candidateName}</h4>
                              <p className="position">{candidate.position}</p>
                            </div>
                            <div className="interview-meta">
                              <span className="date-time">📅 {candidate.interviewDate} at {candidate.interviewTime}</span>
                              <span className="interview-type">🎯 {candidate.interviewType}</span>
                              <span className="duration">⏱️ {candidate.duration}</span>
                              <span className="interviewer">👤 {candidate.interviewer}</span>
                              <span className={`urgency ${candidate.urgency}`}>
                                {candidate.urgency === 'High' ? '🔥' : candidate.urgency === 'Medium' ? '⚠️' : '📝'} {candidate.urgency} Priority
                              </span>
                            </div>
                            <div className="interview-notes">
                              <h5>Interview Notes:</h5>
                              <p>{candidate.interviewNotes}</p>
                            </div>
                          </div>
                          <div className="interview-actions" onClick={(e) => e.stopPropagation()}>
                            <button className="btn btn-primary btn-sm" onClick={() => selectCandidateForEvaluation(candidate)}>📝 Start Evaluation</button>
                            <button className="btn btn-secondary btn-sm">📄 View Recording</button>
                            <button className="btn btn-secondary btn-sm">📎 Download Notes</button>
                            <button className="btn btn-secondary btn-sm" onClick={() => handleQuestionAnswersClick(candidate)}>❓ Question Answers</button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state">
                        <p>No candidates pending evaluation</p>
                        <p className="empty-subtitle">All interviewed candidates have been evaluated.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Detailed Evaluation View */}
                {selectedCandidateForEvaluation && (
                  <div className="evaluation-detail-overlay">
                    <div className="evaluation-detail-modal">
                      <div className="evaluation-header">
                        <div className="candidate-summary">
                          <h2>{selectedCandidateForEvaluation.candidateName}</h2>
                          <p className="position-title">{selectedCandidateForEvaluation.position}</p>
                          <div className="interview-summary">
                            <span>📅 {selectedCandidateForEvaluation.interviewDate}</span>
                            <span>🎯 {selectedCandidateForEvaluation.interviewType}</span>
                            <span>👤 {selectedCandidateForEvaluation.interviewer}</span>
                            <span className={`urgency ${selectedCandidateForEvaluation.urgency}`}>
                              {selectedCandidateForEvaluation.urgency === 'High' ? '🔥' : selectedCandidateForEvaluation.urgency === 'Medium' ? '⚠️' : '📝'} {selectedCandidateForEvaluation.urgency} Priority
                            </span>
                          </div>
                        </div>
                        <button className="close-btn" onClick={closeEvaluationDetail}>✕</button>
                      </div>

                      <div className="evaluation-content">
                        <div className="evaluation-section">
                          <h3>📝 Quick Rating</h3>
                          <div className="rating-grid">
                            <StarRating
                              category="technical"
                              currentRating={evaluationRatings.technical}
                              onRatingChange={setEvaluationRating}
                              label="Technical Skills"
                            />
                            <StarRating
                              category="communication"
                              currentRating={evaluationRatings.communication}
                              onRatingChange={setEvaluationRating}
                              label="Communication"
                            />
                            <StarRating
                              category="problemSolving"
                              currentRating={evaluationRatings.problemSolving}
                              onRatingChange={setEvaluationRating}
                              label="Problem Solving"
                            />
                            <StarRating
                              category="culturalFit"
                              currentRating={evaluationRatings.culturalFit}
                              onRatingChange={setEvaluationRating}
                              label="Cultural Fit"
                            />
                            <StarRating
                              category="leadership"
                              currentRating={evaluationRatings.leadership}
                              onRatingChange={setEvaluationRating}
                              label="Leadership Potential"
                            />
                          </div>
                        </div>

                        <div className="evaluation-section">
                          <h3>📊 Current Ratings</h3>
                          <div className="rating-summary-grid">
                            <div className="rating-summary-item">
                              <span>Technical Skills:</span>
                              <span className="rating-value">{evaluationRatings.technical}/5</span>
                            </div>
                            <div className="rating-summary-item">
                              <span>Communication:</span>
                              <span className="rating-value">{evaluationRatings.communication}/5</span>
                            </div>
                            <div className="rating-summary-item">
                              <span>Problem Solving:</span>
                              <span className="rating-value">{evaluationRatings.problemSolving}/5</span>
                            </div>
                            <div className="rating-summary-item">
                              <span>Cultural Fit:</span>
                              <span className="rating-value">{evaluationRatings.culturalFit}/5</span>
                            </div>
                            <div className="rating-summary-item">
                              <span>Leadership:</span>
                              <span className="rating-value">{evaluationRatings.leadership}/5</span>
                            </div>
                            <div className="rating-summary-item overall">
                              <span>Overall Average:</span>
                              <span className="rating-value">
                                {((evaluationRatings.technical + evaluationRatings.communication + evaluationRatings.problemSolving + evaluationRatings.culturalFit + evaluationRatings.leadership) / 5).toFixed(1)}/5
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="evaluation-section">
                          <h3>📄 Interview Notes</h3>
                          <div className="interview-notes-display">
                            <p>{selectedCandidateForEvaluation.interviewNotes}</p>
                          </div>
                          
                          <h4>Additional Evaluation Notes</h4>
                          <textarea
                            className="evaluation-notes-input"
                            placeholder="Add your evaluation notes, observations, and recommendations..."
                            value={evaluationNotes}
                            onChange={(e) => setEvaluationNotes(e.target.value)}
                          />
                        </div>

                        <div className="evaluation-section">
                          <h3>🎯 Decision</h3>
                          <div className="decision-buttons">
                            <button 
                              className="btn btn-success"
                              onClick={() => submitEvaluation('Selected')}
                              disabled={Object.values(evaluationRatings).some(rating => rating === 0)}
                            >
                              ✅ Select Candidate
                            </button>
                            <button 
                              className="btn btn-warning"
                              onClick={() => submitEvaluation('Hold')}
                              disabled={Object.values(evaluationRatings).some(rating => rating === 0)}
                            >
                              ⏸️ Hold for Review
                            </button>
                            <button 
                              className="btn btn-danger"
                              onClick={() => submitEvaluation('Rejected')}
                              disabled={Object.values(evaluationRatings).some(rating => rating === 0)}
                            >
                              ❌ Reject Candidate
                            </button>
                          </div>
                          <p className="decision-note">
                            Please complete all ratings before making a decision.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : activeSection === 'schedule-interview' ? (
            <div className="schedule-interview-page">
              <div className="content-header">
                <h2>Schedule New Interview</h2>
                <p>Set up a new interview with a candidate</p>
              </div>
              
              <div className="schedule-form-container">
                <div className="schedule-form">
                  <div className="form-section">
                    <h3>Candidate Information</h3>
                    <div className="form-group">
                      <label>Candidate Name *</label>
                      {isLoadingCandidates ? (
                        <div className="form-input" style={{display: 'flex', alignItems: 'center', color: '#6c757d'}}>
                          <div className="loading-spinner" style={{width: '16px', height: '16px', marginRight: '8px'}}></div>
                          Loading candidates...
                        </div>
                      ) : candidatesError ? (
                        <div>
                          <select className="form-select" disabled>
                            <option>Failed to load candidates</option>
                          </select>
                          <small style={{color: '#dc3545', fontSize: '0.875rem', marginTop: '4px', display: 'block'}}>
                            {candidatesError} - Using fallback data
                          </small>
                        </div>
                      ) : (
                        <select
                          className="form-select"
                          value={newInterviewData.candidateEmployeeId}
                          onChange={(e) => handleCandidateSelection(e.target.value)}
                        >
                          <option value="">Select Candidate</option>
                          {employees.map(candidate => (
                            <option key={candidate.employee_id} value={candidate.employee_id}>
                              {candidate.first_name} {candidate.last_name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label>Position *</label>
                      <select
                        className="form-select"
                        value={newInterviewData.position}
                        onChange={(e) => handleScheduleInputChange('position', e.target.value)}
                      >
                        <option value="">Select Position</option>
                        <option value="Frontend Developer">Frontend Developer</option>
                        <option value="Backend Developer">Backend Developer</option>
                        <option value="Full Stack Developer">Full Stack Developer</option>
                        <option value="Data Scientist">Data Scientist</option>
                        <option value="Product Manager">Product Manager</option>
                        <option value="DevOps Engineer">DevOps Engineer</option>
                        <option value="UI/UX Designer">UI/UX Designer</option>
                        <option value="QA Engineer">QA Engineer</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3>Service Order Information</h3>
                    <div className="form-group">
                      <label>Service Order ID</label>
                      {isLoadingServiceOrders ? (
                        <div className="form-input" style={{display: 'flex', alignItems: 'center', color: '#6c757d'}}>
                          <div className="loading-spinner" style={{width: '16px', height: '16px', marginRight: '8px'}}></div>
                          Loading service orders...
                        </div>
                      ) : serviceOrdersError ? (
                        <div>
                          <select className="form-select" disabled>
                            <option>Failed to load service orders</option>
                          </select>
                          <small style={{color: '#dc3545', fontSize: '0.875rem', marginTop: '4px', display: 'block'}}>
                            {serviceOrdersError} - Using fallback data
                          </small>
                        </div>
                      ) : (
                        <select
                          className="form-select"
                          value={newInterviewData.serviceOrderId}
                          onChange={(e) => handleServiceOrderSelection(e.target.value)}
                        >
                          <option value="">Select Service Order</option>
                          {serviceOrders.map(order => (
                            <option key={order.serviceOrderId} value={order.serviceOrderId}>
                              {order.serviceOrderId}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label>Account Name</label>
                      <input 
                        type="text" 
                        placeholder="Auto-filled when service order is selected" 
                        className="form-input"
                        value={newInterviewData.accountName}
                        readOnly
                        style={{backgroundColor: '#f8f9fa', cursor: 'not-allowed'}}
                      />
                      <small style={{color: '#6c757d', fontSize: '0.875rem', marginTop: '4px', display: 'block'}}>
                        Account name is automatically filled when you select a service order above
                      </small>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3>Interview Details</h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Interview Type *</label>
                        <select
                          className="form-select"
                          value={newInterviewData.interviewType}
                          onChange={(e) => handleScheduleInputChange('interviewType', e.target.value)}
                        >
                          <option value="">Select Interview Type</option>
                          <option value="Technical Interview">Technical Interview</option>
                          <option value="Behavioral Interview">Behavioral Interview</option>
                          <option value="System Design">System Design</option>
                          <option value="Coding Challenge">Coding Challenge</option>
                          <option value="Culture Fit">Culture Fit</option>
                          <option value="Final Round">Final Round</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Interview Date *</label>
                        <input
                          type="date"
                          className="form-input"
                          value={newInterviewData.date}
                          onChange={(e) => handleScheduleInputChange('date', e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>Interview Time *</label>
                      <input
                        type="time"
                        className="form-input"
                        value={newInterviewData.time}
                        onChange={(e) => handleScheduleInputChange('time', e.target.value)}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Interviewer *</label>
                      {isLoadingCandidates ? (
                        <div className="form-input" style={{display: 'flex', alignItems: 'center', color: '#6c757d'}}>
                          <div className="loading-spinner" style={{width: '16px', height: '16px', marginRight: '8px'}}></div>
                          Loading employees...
                        </div>
                      ) : employeesError ? (
                        <div>
                          <select className="form-select" disabled>
                            <option>Failed to load employees</option>
                          </select>
                          <small style={{color: '#dc3545', fontSize: '0.875rem', marginTop: '4px', display: 'block'}}>
                            {employeesError} - Using fallback data
                          </small>
                        </div>
                      ) : (
                        <select
                          className="form-select"
                          value={newInterviewData.interviewer}
                          onChange={(e) => handleScheduleInputChange('interviewer', e.target.value)}
                        >
                          <option value="">Select Interviewer</option>
                          {employees.map(candidate => (
                            <option key={candidate.employee_id} value={candidate.employee_id}>
                              {candidate.first_name} {candidate.last_name}
                            </option>
                          ))}

                        </select>
                      )}
                    </div>
                  </div>

                  <div className="form-section">
                    <h3>Meeting Invite</h3>
                    <p className="section-description">Generate a meeting link and send invite to the candidate</p>
                    <div className="form-group">
                      <label>Candidate Email</label>
                      <input 
                        type="email" 
                        placeholder="Auto-filled when candidate is selected" 
                        className="form-input"
                        value={newInterviewData.emailId}
                        readOnly
                        style={{backgroundColor: '#f8f9fa', cursor: 'not-allowed'}}
                      />
                      <small style={{color: '#6c757d', fontSize: '0.875rem', marginTop: '4px', display: 'block'}}>
                        Email is automatically filled when you select a candidate above
                      </small>
                    </div>
                    
                    {!linkGenerated ? (
                      <button 
                        className="btn btn-secondary"
                        onClick={generateMeetingInvite}
                        type="button"
                      >
                        🔗 Generate Meeting Invite
                      </button>
                    ) : (
                      <div className="meeting-link-container">
                        <div className="meeting-link-display">
                          <label>Meeting Link:</label>
                          <div className="link-input-container">
                            <input 
                              type="text" 
                              value={meetingLink}
                              readOnly
                              className="meeting-link-input"
                            />
                            <button 
                              className="btn btn-copy"
                              onClick={copyMeetingLink}
                              title="Copy to clipboard"
                              type="button"
                            >
                              📋
                            </button>
                          </div>
                        </div>
                        
                        <div className="share-options">
                          <button 
                            className="btn btn-primary"
                            onClick={shareMeetingViaEmail}
                            type="button"
                          >
                            📧 Email Invite
                          </button>
                          <button 
                            className="btn btn-secondary"
                            onClick={() => { setLinkGenerated(false); setMeetingLink(''); }}
                            type="button"
                          >
                            🔄 Generate New
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="form-section">
                    <h3>Additional Notes</h3>
                    <div className="form-group">
                      <label>Notes (Optional)</label>
                      <textarea
                        placeholder="Add any special instructions, requirements, or notes for this interview..."
                        className="form-textarea"
                        value={newInterviewData.notes}
                        onChange={(e) => handleScheduleInputChange('notes', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => setActiveSection('dashboard')}
                    >
                      Cancel
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={submitScheduleInterview}
                    >
                      📅 Schedule Interview
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="dashboard-page">
              <div className="content-header">
                <h2>Welcome to Your Dashboard</h2>
                <p>Manage your interview schedules and review completed interviews</p>
              </div>
              
              <div className="dashboard-content">
                {/* Scheduled Interviews Section */}
                <div className="interview-section">
                  <div className="section-header">
                    <div className="section-title">
                      <h3>📅 Evaluation Schedules ({scheduledInterviews.length})</h3>
                      {lastUpdatedScheduled && (
                        <p className="last-updated">
                          Last updated: {lastUpdatedScheduled.toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                    <div className="section-actions">
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={fetchScheduledInterviews}
                        disabled={isLoadingScheduled}
                        title="Refresh data"
                      >
                        🔄 {isLoadingScheduled ? 'Loading...' : 'Refresh'}
                      </button>
                      <button className="btn btn-primary" onClick={openScheduleInterview}>+ Schedule New</button>
                    </div>
                  </div>
                  
                  <div className="interview-list">
                    {isLoadingScheduled ? (
                      <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading scheduled interviews...</p>
                      </div>
                    ) : scheduledError ? (
                      <div className="error-state">
                        <div className="error-content">
                          <span className="error-icon">⚠️</span>
                          <div>
                            <p className="error-message">Failed to load scheduled interviews</p>
                            <p className="error-details">{scheduledError}</p>
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={fetchScheduledInterviews}
                            >
                              🔄 Retry
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : scheduledInterviews.length > 0 ? (
                      scheduledInterviews.map(interview => (
                        <div key={interview.id} className="interview-item scheduled">
                          <div className="interview-info">
                            <div className="candidate-details">
                              <h4>{interview.employeeName || interview.candidateName}</h4>
                              <p className="employee-id">ID: {interview.employeeId}</p>
                            </div>
                            <div className="interview-meta">
                              <span className="date-time">📅 {interview.evaluationDateTime || `${interview.date} at ${interview.time}`}</span>
                              <span className="interview-type">🎯 {interview.evaluationType || interview.interviewType}</span>
                              <span className="interviewer">👤 {interview.interviewerName || interview.interviewer} (ID: {interview.interviewerId})</span>
                              <span className={`status ${interview.status || ''}`}>
                                {interview.status === 'Confirmed' ? '✅' : '⏳'} {interview.status || 'Unknown'}
                              </span>
                            </div>
                          </div>
                          <div className="interview-actions">
                            <button className="btn btn-secondary btn-sm">Edit</button>
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => startScheduledInterview(interview)}
                            >
                              Start
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state">
                        <p>No scheduled interviews</p>
                        <button className="btn btn-primary btn-sm" onClick={openScheduleInterview}>+ Schedule New Interview</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Completed Interviews Section */}
                <div className="interview-section">
                  <div className="section-header">
                    <div className="section-title">
                      <h3>✅ Completed Interviews ({completedInterviews.length})</h3>
                      {lastUpdatedCompleted && (
                        <p className="last-updated">
                          Last updated: {lastUpdatedCompleted.toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                    <div className="section-actions">
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={fetchCompletedInterviews}
                        disabled={isLoadingCompleted}
                        title="Refresh data"
                      >
                        🔄 {isLoadingCompleted ? 'Loading...' : 'Refresh'}
                      </button>
                      <button className="btn btn-secondary">View All</button>
                    </div>
                  </div>
                  
                  <div className="interview-list">
                    {isLoadingCompleted ? (
                      <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading completed interviews...</p>
                      </div>
                    ) : completedError ? (
                      <div className="error-state">
                        <div className="error-content">
                          <span className="error-icon">⚠️</span>
                          <div>
                            <p className="error-message">Failed to load completed interviews</p>
                            <p className="error-details">{completedError}</p>
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={fetchCompletedInterviews}
                            >
                              🔄 Retry
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : completedInterviews.length > 0 ? (
                      completedInterviews.map(interview => (
                        <div key={interview.id} className="interview-item completed">
                          <div className="interview-info">
                            <div className="candidate-details">
                              <h4>{interview.candidateName}</h4>
                              <p className="position">{interview.position}</p>
                            </div>
                            <div className="interview-meta">
                              <span className="date-time">📅 {interview.date} at {interview.time}</span>
                              <span className="interview-type">🎯 {interview.interviewType}</span>
                              <span className="duration">⏱️ {interview.duration}</span>
                              <div className="rating">
                                <span className="stars">
                                  {Array.from({length: 5}, (_, i) => (
                                    <span key={i} className={i < Math.floor(interview.rating) ? 'star filled' : 'star empty'}>
                                      {i < Math.floor(interview.rating) ? '⭐' : '☆'}
                                    </span>
                                  ))}
                                </span>
                                <span className="rating-value">{interview.rating}/5</span>
                              </div>
                              <span className={`status ${interview.status ? interview.status.replace(' ', '-') : ''}`}>
                                {interview.status === 'Hired' ? '🎉' : '📋'} {interview.status || 'Unknown'}
                              </span>
                            </div>
                          </div>
                          <div className="interview-actions">
                            <button className="btn btn-secondary btn-sm">View Details</button>
                            <button className="btn btn-secondary btn-sm">Download</button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state">
                        <p>No completed interviews</p>
                        <p className="empty-subtitle">Completed interviews will appear here after conducting them.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="App-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>About</h4>
            <p>Your application description here.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#support">Support</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>© 2024 Interview Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Question Answers Popup */}
      {showQuestionAnswersPopup && (
        <div className="popup-overlay" onClick={() => setShowQuestionAnswersPopup(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h3>Question Answers</h3>
              <button className="popup-close" onClick={() => setShowQuestionAnswersPopup(false)}>×</button>
            </div>
            <div className="popup-body">
              <div className="transcript-content">
                <h4>Transcript LLM Response:</h4>
                <div className="transcript-text">
                  {typeof popupTranscriptData === 'string' ? (
                    <pre>{popupTranscriptData}</pre>
                  ) : (
                    <pre>{JSON.stringify(popupTranscriptData, null, 2)}</pre>
                  )}
                </div>
              </div>
            </div>
            <div className="popup-footer">
              <button className="btn btn-secondary" onClick={() => setShowQuestionAnswersPopup(false)}>Close</button>
              <button className="btn btn-primary" onClick={() => {
                navigator.clipboard.writeText(typeof popupTranscriptData === 'string' ? popupTranscriptData : JSON.stringify(popupTranscriptData, null, 2));
                alert('Copied to clipboard!');
              }}>Copy to Clipboard</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
