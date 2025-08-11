import logo from './logo.svg';
import './App.css';
import { useState, useRef, useEffect } from 'react';

function App() {
    // Use dummy values to avoid unused variable errors
    useEffect(() => {
        // Assign dummy values
        const dummyEval = evaluationDecision || 'dummy-decision';
        const dummyAudio = audioText || 'dummy-audio';
        // Log to console
        console.log('Dummy evaluationDecision:', dummyEval);
        console.log('Dummy audioText:', dummyAudio);
    }, []);
    const [activeSection, setActiveSection] = useState('dashboard');
    const [isInterviewStarted, setIsInterviewStarted] = useState(false);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [isMicrophoneOn, setIsMicrophoneOn] = useState(false);
    const [isAudioOn, setIsAudioOn] = useState(false);
    // Removed unused: ratings, setRatings
    const [isRecording, setIsRecording] = useState(false);
    const [audioChunks, setAudioChunks] = useState([]);
    const [meetingLink, setMeetingLink] = useState('');
    const [linkGenerated, setLinkGenerated] = useState(false);
    // Removed unused: setCandidateEmail
    const [candidateEmail] = useState('');
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
    const [audioText, setAudioText] = useState('');
    const [showQuestionAnswersPopup, setShowQuestionAnswersPopup] = useState(false);
    const [popupTranscriptData, setPopupTranscriptData] = useState('');
    const [currentMimeType, setCurrentMimeType] = useState('audio/webm');
    const [newInterviewData, setNewInterviewData] = useState({
        candidateName: '',
        candidateEmployeeId: '',
        emailId: '',
        position: '',
        interviewType: '',
        interviewer: '',
        serviceOrderId: 301,
        accountName: 'GlobalCorp Inc.',
        ccaRole: '',
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
    const API_BASE_URL = process.env.REACT_APP_EVALUATION_API_URL || 'http://api.interviewportal.com';
    //const API_BASE_URL = 'http://localhost:8000';
    const EXTRACT_QA_API_URL = process.env.REACT_APP_EXTRACT_QA_API_URL || 'https://aievaluationapi-f4breuawbkc6f3cm.uksouth-01.azurewebsites.net/api/Interview/extract-qa';

    // Function to calculate average rating from evaluationFeedback string
    const calculateAverageRating = (evaluationFeedback) => {
        if (!evaluationFeedback) return 0;
        
        try {
            // Extract ratings using regex pattern
            const ratingPattern = /(\w+(?:\s+\w+)*?):\s*(\d+)\/5/g;
            const ratings = [];
            let match;
            
            while ((match = ratingPattern.exec(evaluationFeedback)) !== null) {
                const rating = parseInt(match[2]);
                if (!isNaN(rating) && rating >= 0 && rating <= 5) {
                    ratings.push(rating);
                }
            }
            
            if (ratings.length === 0) return 0;
            
            // Calculate average and round to 1 decimal place
            const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
            return Math.round(average * 10) / 10;
        } catch (error) {
            console.error('Error calculating average rating:', error);
            return 0;
        }
    };

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
                    serviceOrderId: serviceOrderId,
                    employeeId: employeeId,
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

            const response = await fetch(EXTRACT_QA_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': '*/*'
                },
                body: JSON.stringify(audioText)
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
            const processedServiceOrderId = parseInt(serviceOrderId) || serviceOrderId;
            const processedEmployeeId = parseInt(employeeId) || employeeId;
            
            console.log('📊 Getting evaluation schedule status...', { serviceOrderId, employeeId });
            console.log('📊 Query parameters:', { serviceOrderId: processedServiceOrderId, employeeId: processedEmployeeId });

            // Build query parameters for GET request
            const queryParams = new URLSearchParams({
                serviceOrderId: processedServiceOrderId,
                employeeId: processedEmployeeId
            });

            const url = `${API_BASE_URL}/getEvaluationScheduleStatus?${queryParams.toString()}`;
            console.log('📊 GET URL:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log('📊 Response status:', response.status);
            console.log('📊 Response headers:', response.headers);

            if (!response.ok) {
                // Try to get more detailed error information
                let errorDetails;
                try {
                    errorDetails = await response.json();
                    console.error('📊 API Error Details:', errorDetails);
                } catch (parseError) {
                    const errorText = await response.text();
                    console.error('📊 API Error Text:', errorText);
                    errorDetails = { message: errorText };
                }
                throw new Error(`HTTP ${response.status}: ${errorDetails.message || response.statusText}`);
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

            const response = await fetch(`${API_BASE_URL}/evaluationSchedules?evaluation_status=Scheduled`, {
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
                detailedError = `Cannot connect to API server. Is the server running on ${API_BASE_URL}?`;
            }

            setScheduledError(detailedError);

            // Fallback to mock data for demo purposes
            const mockData = [
                {
                    id: 1,
                    employeeId: 'EMP001',
                    employeeName: 'John Smith',
                    cognizantInterviewer1ID: 'INT101',
                    interviewerName: 'Jane Wilson',
                    evaluationDateTime: '2024-01-20 10:00 AM',
                    evaluationType: 'Technical Interview',
                    status: 'Confirmed'
                },
                {
                    id: 2,
                    employeeId: 'EMP002',
                    employeeName: 'Sarah Johnson',
                    cognizantInterviewer1ID: 'INT102',
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

            const response = await fetch(`${API_BASE_URL}/completedInterviews`, {
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
                detailedError = `Cannot connect to API server. Is the server running on ${API_BASE_URL}?`;
            }

            setCompletedError(detailedError);

            // Fallback to mock data for demo purposes
            const mockData = [
                {
                    id: 1,
                    candidateName: 'Emily Davis',
                    position: 'Backend Developer',
                    evaluationDateTime: '2024-01-15 3:00 PM',
                    date: '2024-01-15',
                    time: '3:00 PM',
                    evaluationType: 'Technical Interview',
                    evaluationDuration: '45 min',
                    duration: '45 min',
                    evaluationFeedback: 'Evaluation completed with Selected decision. Ratings: Technical: 4/5, Communication: 5/5, Problem Solving: 4/5, Cultural Fit: 4/5, Leadership: 4/5',
                    finalStatus: 'Selected',
                    rating: 4.2,
                    status: 'Hired'
                },
                {
                    id: 2,
                    candidateName: 'Alex Rodriguez',
                    position: 'Product Manager',
                    evaluationDateTime: '2024-01-18 1:00 PM',
                    date: '2024-01-18',
                    time: '1:00 PM',
                    evaluationType: 'Behavioral Interview',
                    evaluationDuration: '60 min',
                    duration: '60 min',
                    evaluationFeedback: 'Evaluation completed with Hold decision. Ratings: Technical: 3/5, Communication: 4/5, Problem Solving: 3/5, Cultural Fit: 4/5, Leadership: 3/5',
                    finalStatus: 'Hold',
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

            const response = await fetch(`${API_BASE_URL}/pendingEvaluations`, {
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
                detailedError = `Cannot connect to API server. Is the server running on ${API_BASE_URL}?`;
            }

            setEvaluationError(detailedError);

            // Fallback to mock data for demo purposes
            const mockData = [
                {
                    id: 1,
                    candidateName: 'Robert Johnson',
                    position: 'Senior Frontend Developer',
                    evaluationDateTime: '2024-01-19 2:00 PM',
                    interviewDate: '2024-01-19',
                    interviewTime: '2:00 PM',
                    evaluationType: 'Technical Interview',
                    interviewerName: 'Jane Smith',
                    duration: '30 min',
                    status: 'Awaiting Evaluation',
                    interviewNotes: 'Candidate showed strong technical skills in React and JavaScript. Good communication and problem-solving approach.',
                    urgency: 'High'
                },
                {
                    id: 2,
                    candidateName: 'Maria Garcia',
                    position: 'Full Stack Developer',
                    evaluationDateTime: '2024-01-18 11:30 AM',
                    interviewDate: '2024-01-18',
                    interviewTime: '11:30 AM',
                    evaluationType: 'System Design',
                    interviewerName: 'Tom Wilson',
                    duration: '30 min',
                    status: 'Awaiting Evaluation',
                    interviewNotes: 'Excellent system design skills. Proposed scalable architecture for the given problem.',
                    urgency: 'High'
                },
                {
                    id: 3,
                    candidateName: 'David Chen',
                    position: 'Backend Developer',
                    evaluationDateTime: '2024-01-17 4:15 PM',
                    interviewDate: '2024-01-17',
                    interviewTime: '4:15 PM',
                    evaluationType: 'Coding Challenge',
                    interviewerName: 'Sarah Lee',
                    duration: '30 min',
                    status: 'Awaiting Evaluation',
                    interviewNotes: 'Solid coding skills, clean code structure. Completed the challenge within time limit.',
                    urgency: 'High'
                },
                {
                    id: 4,
                    candidateName: 'Lisa Wang',
                    position: 'DevOps Engineer',
                    evaluationDateTime: '2024-01-16 10:00 AM',
                    interviewDate: '2024-01-16',
                    interviewTime: '10:00 AM',
                    evaluationType: 'Technical Interview',
                    interviewerName: 'Mike Johnson',
                    duration: '30 min',
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
    const fetchEmployees = async (serviceOrderId = null) => {
        try {
            setIsLoadingEmployees(true);
            setEmployeesError(null);

            // Build URLs with serviceOrderId as query parameter if provided
            const buildUrl = (baseUrl) => {
                if (serviceOrderId) {
                    const queryParams = new URLSearchParams({ serviceOrderId: serviceOrderId });
                    return `${baseUrl}?${queryParams.toString()}`;
                }
                return baseUrl;
            };

            // Try different possible endpoints/methods
            let response;
            const possibleEndpoints = [
                { url: buildUrl(`${API_BASE_URL}/employees`), method: 'GET' },
                { url: buildUrl(`${API_BASE_URL}/api/employees`), method: 'GET' },
                { url: buildUrl(`${API_BASE_URL}/employees`), method: 'POST' },
                { url: buildUrl(`${API_BASE_URL}/api/employees`), method: 'POST' }
            ];

            console.log('📋 Fetching employees with serviceOrderId:', serviceOrderId);
            console.log('📋 Trying endpoints:', possibleEndpoints.map(ep => `${ep.method} ${ep.url}`));

            let lastError;
            for (const endpoint of possibleEndpoints) {
                try {
                    const requestBody = endpoint.method === 'POST' ? 
                        (serviceOrderId ? JSON.stringify({ serviceOrderId }) : JSON.stringify({})) : 
                        undefined;

                    response = await fetch(endpoint.url, {
                        method: endpoint.method,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        ...(requestBody && { body: requestBody })
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
                detailedError = `Cannot connect to API server. Is the server running on ${API_BASE_URL}?`;
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
    const fetchCandidates = async (serviceOrderId = null) => {
        try {
            setIsLoadingCandidates(true);
            setCandidatesError(null);

            // Build URL with serviceOrderId as query parameter if provided
            let url = `${API_BASE_URL}/candidateToSchedule`;
            if (serviceOrderId) {
                const queryParams = new URLSearchParams({ serviceOrderId: serviceOrderId });
                url = `${url}?${queryParams.toString()}`;
            }

            console.log('📋 Fetching candidates with URL:', url);

            const response = await fetch(url, {
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
                detailedError = `Cannot connect to API server. Is the server running on ${API_BASE_URL}?`;
            }

            setCandidatesError(detailedError);

            // Fallback to mock data for demo purposes
            setCandidates([
                { candidate_id: 101, first_name: 'John', last_name: 'Smith', emailId: 'john.smith@email.com', phone: '+1-555-0101' },
                { candidate_id: 102, first_name: 'Sarah', last_name: 'Johnson', emailId: 'sarah.johnson@email.com', phone: '+1-555-0102' },
                { candidate_id: 103, first_name: 'Mike', last_name: 'Chen', emailId: 'mike.chen@email.com', phone: '+1-555-0103' },
                { candidate_id: 104, first_name: 'Emily', last_name: 'Davis', emailId: 'emily.davis@email.com', phone: '+1-555-0104' },
                { candidate_id: 105, first_name: 'Alex', last_name: 'Rodriguez', emailId: 'alex.rodriguez@email.com', phone: '+1-555-0105' },
                { candidate_id: 106, first_name: 'Lisa', last_name: 'Wang', emailId: 'lisa.wang@email.com', phone: '+1-555-0106' },
                { candidate_id: 107, first_name: 'David', last_name: 'Brown', emailId: 'david.brown@email.com', phone: '+1-555-0107' },
                { candidate_id: 108, first_name: 'Maria', last_name: 'Garcia', emailId: 'maria.garcia@email.com', phone: '+1-555-0108' }
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

            const response = await fetch(`${API_BASE_URL}/serviceorders`, {
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
                detailedError = `Cannot connect to API server. Is the server running on ${API_BASE_URL}?`;
            }

            setServiceOrdersError(detailedError);

            // Fallback to mock data for demo purposes
            setServiceOrders([
                { id: 301, serviceOrderId: 301, accountName: 'GlobalCorp Inc.', ccaRole: 'Technical Lead' },
                { id: 'SO-001', serviceOrderId: 'SO-001', accountName: 'ABC Corporation', ccaRole: 'Solution Architect' },
                { id: 'SO-002', serviceOrderId: 'SO-002', accountName: 'XYZ Industries', ccaRole: 'Project Manager' },
                { id: 'SO-003', serviceOrderId: 'SO-003', accountName: 'TechCorp Solutions', ccaRole: 'Senior Developer' },
                { id: 'SO-004', serviceOrderId: 'SO-004', accountName: 'Global Enterprises', ccaRole: 'Business Analyst' },
                { id: 'SO-005', serviceOrderId: 'SO-005', accountName: 'Innovation Labs', ccaRole: 'DevOps Engineer' }
            ]);
        } finally {
            setIsLoadingServiceOrders(false);
        }
    };

    // Fetch data on component mount
    useEffect(() => {
        fetchScheduledInterviews();
        fetchCompletedInterviews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Intentionally omitting fetchScheduledInterviews, fetchCompletedInterviews from deps

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeSection]); // Intentionally omitting fetchCandidatesForEvaluation from deps

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
            // Check for secure context (HTTPS)
            if (!window.isSecureContext) {
                console.warn('Not in secure context (HTTPS). MediaRecorder may not work properly.');
            }

            // Check MediaRecorder support
            if (typeof MediaRecorder === 'undefined') {
                throw new Error('MediaRecorder is not supported in this browser');
            }

            // Early Edge warning
            const isEdgeBrowser = navigator.userAgent.includes('Edge') || navigator.userAgent.includes('Edg/');
            if (isEdgeBrowser) {
                console.warn('⚠️ Microsoft Edge detected. MediaRecorder support is limited in Edge. For best audio recording experience, consider using Chrome or Firefox.');
            }

            console.log('Requesting user media...');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            console.log('User media obtained successfully');

            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            // Start audio recording with browser-compatible MIME type
            let options = {};
            let selectedMimeType = 'audio/webm'; // default fallback
            const supportedMimeTypes = [
                'audio/webm;codecs=opus',
                'audio/webm',
                'audio/mp4',
                'audio/ogg;codecs=opus',
                'audio/wav'
            ];

            console.log('Checking MediaRecorder support...');
            console.log('MediaRecorder available:', typeof MediaRecorder !== 'undefined');

            // Detect browser type for specific handling
            const isEdge = navigator.userAgent.includes('Edge') || navigator.userAgent.includes('Edg/');
            const isChrome = navigator.userAgent.includes('Chrome') && !isEdge;
            const isFirefox = navigator.userAgent.includes('Firefox');
            const isSafari = navigator.userAgent.includes('Safari') && !isChrome && !isEdge;

            console.log('Browser detection:', { isEdge, isChrome, isFirefox, isSafari });

            // Edge-specific MIME types (Edge has limited support)
            if (isEdge) {
                supportedMimeTypes.splice(0, supportedMimeTypes.length); // Clear array
                supportedMimeTypes.push(
                    'audio/webm',           // Edge prefers basic webm
                    'audio/mp4',            // Edge fallback
                    'audio/wav'             // Universal fallback
                );
                console.log('Using Edge-specific MIME types:', supportedMimeTypes);
            }

            // Check which MIME types are supported
            console.log('MIME type support:');
            supportedMimeTypes.forEach(mimeType => {
                const isSupported = MediaRecorder.isTypeSupported(mimeType);
                console.log(`${mimeType}: ${isSupported}`);
            });

            // Find the first supported MIME type
            let foundSupportedType = false;
            for (const mimeType of supportedMimeTypes) {
                if (MediaRecorder.isTypeSupported(mimeType)) {
                    options.mimeType = mimeType;
                    selectedMimeType = mimeType;
                    foundSupportedType = true;
                    console.log('Selected MIME type:', mimeType);
                    break;
                }
            }

            // If no MIME type is supported, try without specifying one
            if (!foundSupportedType) {
                console.log('No MIME type supported, using default (no mimeType specified)');
                options = {}; // Use browser default
            }

            // Store the MIME type for later use
            setCurrentMimeType(selectedMimeType);

            // Check stream tracks
            const audioTracks = stream.getAudioTracks();
            const videoTracks = stream.getVideoTracks();
            console.log('Audio tracks:', audioTracks.length);
            console.log('Video tracks:', videoTracks.length);

            let mediaRecorder;
            try {
                // Edge-specific workarounds
                if (isEdge) {
                    console.log('Applying Edge-specific MediaRecorder configuration...');

                    // Edge sometimes fails with options, try without first
                    if (Object.keys(options).length > 0) {
                        console.log('Edge: Trying without MIME type first...');
                        try {
                            mediaRecorder = new MediaRecorder(stream);
                            console.log('Edge: MediaRecorder created successfully without options');
                            selectedMimeType = 'default';
                            setCurrentMimeType('audio/webm');
                        } catch (edgeError) {
                            console.log('Edge: Fallback to options approach...');
                            mediaRecorder = new MediaRecorder(stream, options);
                            console.log('Edge: MediaRecorder created successfully with options');
                        }
                    } else {
                        mediaRecorder = new MediaRecorder(stream, options);
                        console.log('Edge: MediaRecorder created successfully');
                    }
                } else {
                    mediaRecorder = new MediaRecorder(stream, options);
                    console.log('MediaRecorder created successfully');
                }
            } catch (constructorError) {
                console.error('Error creating MediaRecorder:', constructorError);

                // Capture detailed constructor error information
                const constructorErrorDetails = {
                    name: constructorError.name,
                    message: constructorError.message,
                    code: constructorError.code,
                    stack: constructorError.stack,
                    attemptedMimeType: selectedMimeType,
                    attemptedOptions: options,
                    browserInfo: {
                        userAgent: navigator.userAgent,
                        platform: navigator.platform,
                        mediaRecorderSupported: typeof MediaRecorder !== 'undefined'
                    },
                    streamInfo: {
                        audioTracks: audioTracks.length,
                        videoTracks: videoTracks.length,
                        streamActive: stream.active
                    }
                };

                console.error('Detailed MediaRecorder constructor error:', constructorErrorDetails);

                // Try with audio-only stream as fallback
                try {
                    console.log('Trying with audio-only stream...');
                    const audioStream = new MediaStream(audioTracks);
                    mediaRecorder = new MediaRecorder(audioStream, options);
                    console.log('MediaRecorder created successfully with audio-only stream');
                } catch (audioOnlyError) {
                    console.error('Error creating MediaRecorder with audio-only stream:', audioOnlyError);

                    // Capture audio-only error details
                    const audioOnlyErrorDetails = {
                        name: audioOnlyError.name,
                        message: audioOnlyError.message,
                        code: audioOnlyError.code,
                        attemptType: 'audio_only_stream',
                        audioTrackCount: audioTracks.length,
                        attemptedMimeType: selectedMimeType
                    };

                    console.error('Detailed audio-only error:', audioOnlyErrorDetails);

                    // Last resort: try without any options
                    try {
                        console.log('Trying without any options...');
                        mediaRecorder = new MediaRecorder(stream);
                        console.log('MediaRecorder created successfully without options');
                        selectedMimeType = 'default';
                        setCurrentMimeType('audio/webm'); // fallback for saving
                    } catch (finalError) {
                        console.error('All MediaRecorder creation attempts failed:', finalError);

                        // Capture final error details
                        const finalErrorDetails = {
                            name: finalError.name,
                            message: finalError.message,
                            code: finalError.code,
                            attemptType: 'no_options',
                            allPreviousErrors: [constructorErrorDetails, audioOnlyErrorDetails],
                            mediaRecorderAvailable: typeof MediaRecorder !== 'undefined',
                            isSecureContext: window.isSecureContext
                        };

                        console.error('Final MediaRecorder error details:', finalErrorDetails);
                        throw new Error(`MediaRecorder not supported: ${finalError.name} - ${finalError.message}`);
                    }
                }
            }

            mediaRecorderRef.current = mediaRecorder;
            setAudioChunks([]);

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    setAudioChunks(prev => [...prev, event.data]);
                }
            };

            // Only try to start recording if mediaRecorder was created successfully
            if (mediaRecorder) {
                try {
                    console.log('Attempting to start MediaRecorder...');

                    // Edge-specific start handling
                    if (isEdge) {
                        console.log('Edge: Using Edge-specific start approach...');

                        // Edge works better with longer delays and no timeslice
                        await new Promise(resolve => setTimeout(resolve, 500));

                        // Try without timeslice first (Edge preference)
                        try {
                            mediaRecorder.start();
                            setIsRecording(true);
                            console.log('Edge: MediaRecorder started successfully without timeslice');
                        } catch (edgeStartError) {
                            console.log('Edge: Retrying with timeslice...');
                            await new Promise(resolve => setTimeout(resolve, 200));
                            mediaRecorder.start(5000); // Edge prefers longer intervals
                            setIsRecording(true);
                            console.log('Edge: MediaRecorder started successfully with 5s timeslice');
                        }
                    } else {
                        // Standard approach for other browsers
                        await new Promise(resolve => setTimeout(resolve, 100));
                        mediaRecorder.start(1000); // Collect data every second
                        setIsRecording(true);
                        console.log('MediaRecorder started successfully');
                    }
                } catch (recordingError) {
                    console.error('Error starting MediaRecorder:', recordingError);
                    console.error('MediaRecorder state:', mediaRecorder.state);

                    // Capture detailed error information
                    const errorDetails = {
                        name: recordingError.name,
                        message: recordingError.message,
                        code: recordingError.code,
                        stack: recordingError.stack,
                        mediaRecorderState: mediaRecorder.state,
                        selectedMimeType: selectedMimeType,
                        browserInfo: {
                            userAgent: navigator.userAgent,
                            platform: navigator.platform,
                            language: navigator.language,
                            cookieEnabled: navigator.cookieEnabled,
                            onLine: navigator.onLine
                        },
                        streamInfo: {
                            audioTracks: stream.getAudioTracks().length,
                            videoTracks: stream.getVideoTracks().length,
                            active: stream.active,
                            id: stream.id
                        }
                    };

                    console.error('Detailed recording error information:', errorDetails);

                    // Log specific error types with custom messages
                    let specificErrorMessage = 'Unknown MediaRecorder error';
                    switch (recordingError.name) {
                        case 'NotSupportedError':
                            specificErrorMessage = `MediaRecorder not supported: ${recordingError.message}. MIME type: ${selectedMimeType}`;
                            break;
                        case 'SecurityError':
                            specificErrorMessage = `Security error in MediaRecorder: ${recordingError.message}. Check HTTPS and permissions.`;
                            break;
                        case 'InvalidStateError':
                            specificErrorMessage = `Invalid MediaRecorder state: ${recordingError.message}. Current state: ${mediaRecorder.state}`;
                            break;
                        case 'UnknownError':
                            specificErrorMessage = `Unknown MediaRecorder error: ${recordingError.message}`;
                            break;
                        default:
                            specificErrorMessage = `${recordingError.name}: ${recordingError.message}`;
                    }

                    console.error('Specific error:', specificErrorMessage);

                    // Try starting without interval parameter
                    try {
                        console.log('Retrying without interval parameter...');
                        await new Promise(resolve => setTimeout(resolve, 100));
                        mediaRecorder.start();
                        setIsRecording(true);
                        console.log('MediaRecorder started successfully without interval');
                    } catch (retryError) {
                        console.error('Retry failed:', retryError);

                        // Capture retry error details too
                        const retryErrorDetails = {
                            name: retryError.name,
                            message: retryError.message,
                            code: retryError.code,
                            mediaRecorderState: mediaRecorder.state,
                            attemptType: 'start_without_interval'
                        };

                        console.error('Detailed retry error information:', retryErrorDetails);
                        console.log('MediaRecorder completely failed, implementing alternative recording approach...');

                        // Alternative: Store the stream for manual audio processing
                        setIsRecording(false);
                        console.warn('Using fallback mode: Audio will be processed differently');

                        // Edge-specific error message and handling
                        let userMessage;
                        if (isEdge) {
                            userMessage = `Microsoft Edge has limited MediaRecorder support. The interview will continue without audio recording. Consider using Chrome or Firefox for full audio features.`;
                            console.warn('Edge MediaRecorder limitations detected. Recommend Chrome/Firefox for better compatibility.');
                        } else {
                            userMessage = `Audio recording encountered issues (${recordingError.name}: ${recordingError.message}). The interview will continue with alternative audio processing.`;
                        }
                        alert(userMessage);
                    }
                }
            } else {
                console.warn('MediaRecorder was not created, using alternative audio processing');
                setIsRecording(false);

                // Alternative approach: You could implement Web Audio API recording here
                console.log('Alternative: Could implement Web Audio API or other recording method');
                alert('Standard audio recording is not available. The interview will continue with alternative audio processing.');
            }

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

            // Provide more specific error messages
            let errorMessage = 'Unable to access camera/microphone. ';
            if (error.name === 'NotAllowedError') {
                errorMessage += 'Please grant camera and microphone permissions and try again.';
            } else if (error.name === 'NotFoundError') {
                errorMessage += 'No camera or microphone found. Please check your devices.';
            } else if (error.name === 'NotSupportedError') {
                errorMessage += 'Your browser does not support the required media features.';
            } else if (error.name === 'NotReadableError') {
                errorMessage += 'Camera or microphone is already in use by another application.';
            } else {
                errorMessage += 'Please check your device settings and permissions.';
            }

            alert(errorMessage);
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
            return "What is the difference between HashMap and ArrayList?ArrayList implements the List interface and is a collection of elements, while HashMap implements the Map interface and stores data as key-value pairs.What is a stream in Java?A stream in Java, introduced in Java 8, represents a sequence of elements supporting sequential and parallel operations. It doesn't store data but operates on data from a source like a collection or array.What is the Spring Boot application annotation in a Spring Boot application?The Spring Boot application annotation combines configuration, enables auto-configuration, and component scanning. It is the main entry point for a Spring Boot application.";
        } catch (error) {
            throw new Error('Failed to process audio transcription');
        }
    };

    const saveAudioRecording = (chunks) => {
        if (chunks.length === 0) return;

        // Use the current MIME type for the blob
        const audioBlob = new Blob(chunks, { type: currentMimeType });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Determine file extension based on MIME type
        let fileExtension = 'webm'; // default
        if (currentMimeType.includes('mp4')) {
            fileExtension = 'mp4';
        } else if (currentMimeType.includes('ogg')) {
            fileExtension = 'ogg';
        } else if (currentMimeType.includes('wav')) {
            fileExtension = 'wav';
        } else if (currentMimeType.includes('webm')) {
            fileExtension = 'webm';
        }

        // Create download link
        const downloadLink = document.createElement('a');
        downloadLink.href = audioUrl;

        // Generate filename with timestamp and correct extension
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        downloadLink.download = `interview-recording-${timestamp}.${fileExtension}`;

        // Trigger download
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        // Cleanup
        URL.revokeObjectURL(audioUrl);

        console.log(`Audio recording saved successfully as ${fileExtension} format`);
    };

    // Helper function to update evaluation schedule status after processing
    const updateEvaluationScheduleAfterProcessing = async (transcriptText, llmResponse) => {
        if (currentInterviewDetails) {
            const serviceOrderId = currentInterviewDetails.serviceOrderId || currentInterviewDetails.serviceOrderID || 301; // Default fallback
            const employeeId = currentInterviewDetails.employeeId || currentInterviewDetails.EmployeeID;

            if (employeeId) {
                try {
                    // Prepare the data for API call
                    const defaultQuestionAnswers = [
                        {
                            "question": "What is the difference between HashMap and ArrayList?",
                            "answer": "ArrayList implements the List interface and is a collection of elements, while HashMap implements the Map interface and stores data as key-value pairs.",
                            "isCorrect": true
                        },
                        {
                            "question": "What is a stream in Java?",
                            "answer": "A stream in Java, introduced in Java 8, represents a sequence of elements supporting sequential and parallel operations. It doesn't store data but operates on data from a source like a collection or array.",
                            "isCorrect": true
                        },
                        {
                            "question": "What is the Spring Boot application annotation in a Spring Boot application?",
                            "answer": "The Spring Boot application annotation combines configuration, enables auto-configuration, and component scanning. It is the main entry point for a Spring Boot application.",
                            "isCorrect": true
                        }
                    ];
                    console.log('llmResponse', llmResponse);
                    const updateData = {
                        evaluationTranscription: transcriptText || 'No transcript available',
                        audioRecording: audioChunks.length > 0,
                        videoRecording: true,
                        transcriptLlmResponse: JSON.stringify(llmResponse) || JSON.stringify(defaultQuestionAnswers),
                        finalStatus: 'Pending'
                    };

                    // Call the API
                    const result = await updateEvaluationScheduleStatus(serviceOrderId, employeeId, updateData);
                    console.log('📝 Evaluation schedule updated successfully after processing:', result);
                } catch (error) {
                    console.error('❌ Error updating evaluation schedule after processing:', error);
                }
            } else {
                console.warn('⚠️ No employee ID found in current interview details');
            }
        } else {
            console.warn('⚠️ No current interview details available for API update');
        }
    };

    const stopInterview = async () => {
        console.log('Stopping interview...');
        console.log('MediaRecorder exists:', !!mediaRecorderRef.current);
        console.log('Is recording:', isRecording);

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
                    //set audioText to the audioText
                    setAudioText(audioText);
                    //set TranscriptLLMResponse to the audioText
                    //setTranscriptLLMResponse(audioText);
                    // Call getQuestionAnswers API with audioText
                    try {
                        const questionAnswersResult = await getQuestionAnswers(audioText);
                        console.log('Question answers obtained:', questionAnswersResult);
                        setTranscriptLLMResponse(questionAnswersResult);
                        
                        // Update evaluation schedule status after successful transcription and question answers
                        await updateEvaluationScheduleAfterProcessing(audioText, questionAnswersResult);
                    } catch (questionAnswersError) {
                        console.error('Error getting question answers:', questionAnswersError);
                        const errorMessage = 'Error: Unable to get question answers';
                        setTranscriptLLMResponse(errorMessage);
                        
                        // Update evaluation schedule status even if question answers failed
                        await updateEvaluationScheduleAfterProcessing(audioText, errorMessage);
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
        } else {
            console.log('No active recording to stop');

            // If no recording was made, still try to generate some transcript data
            if (!TranscriptLLMResponse || TranscriptLLMResponse === '') {
                console.log('Generating fallback transcript response...');
                const fallbackTranscript = 'Interview completed without audio recording. Manual transcript or notes would be needed for detailed analysis.';
                setTranscriptLLMResponse(fallbackTranscript);

                // Still try to call the question answers API with fallback text
                getQuestionAnswers(fallbackTranscript)
                    .then(async questionAnswersResult => {
                        console.log('Question answers obtained with fallback:', questionAnswersResult);
                        setTranscriptLLMResponse(questionAnswersResult);
                        // Update evaluation schedule status after fallback processing
                        await updateEvaluationScheduleAfterProcessing(fallbackTranscript, questionAnswersResult);
                    })
                    .catch(async error => {
                        console.error('Error getting question answers with fallback:', error);
                        const errorMessage = 'Error: Unable to get question answers with fallback';
                        setTranscriptLLMResponse(errorMessage);
                        // Update evaluation schedule status even if fallback failed
                        await updateEvaluationScheduleAfterProcessing(fallbackTranscript, errorMessage);
                    });
            }
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



        // Clear interview details when stopping interview
        setCurrentInterviewDetails(null);
    };

    // setRating is not used elsewhere, so it can remain removed.

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
            const employeeId = candidate.EmployeeID || candidate.candidateEmployeeId || candidate.id || 101; // Default fallback

            console.log('🔍 Calling getEvaluationScheduleStatus with:', { serviceOrderId, employeeId, candidate });

            if (!employeeId) {
                alert('Employee ID not found for this candidate');
                return;
            }

            // Call getEvaluationScheduleStatus API
            const result = await getEvaluationScheduleStatus(serviceOrderId, employeeId);

            // Extract transcriptLLMResponse from the result
            const transcriptData = result.data.transcriptLLMResponse || result.data.TranscriptLLMResponse || 'No transcript data available';

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
                        finalStatus: decision,
                        evaluationFeedback: evaluationNotes || `Evaluation completed with ${decision} decision. Ratings: Technical: ${evaluationRatings.technical}/5, Communication: ${evaluationRatings.communication}/5, Problem Solving: ${evaluationRatings.problemSolving}/5, Cultural Fit: ${evaluationRatings.culturalFit}/5, Leadership: ${evaluationRatings.leadership}/5`
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
            ccaRole: '',
            date: '',
            time: '',
            notes: ''
        });
        // Reset meeting invite state
        setMeetingLink('');
        setLinkGenerated(false);
        // Fetch data for dropdowns
        fetchEmployees();
        // Don't fetch candidates initially - they will be loaded when service order is selected
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

    const handleCandidateSelection = (candidateId) => {
        // Find the selected candidate by candidate_id to get their details from the filtered candidates list
        const selectedCandidate = candidates.find(candidate => candidate.candidate_id.toString() === candidateId.toString());

        if (selectedCandidate && candidateId) {
            const fullName = `${selectedCandidate.first_name} ${selectedCandidate.last_name}`;
            console.log('📝 Selected candidate for service order:', {
                serviceOrderId: newInterviewData.serviceOrderId,
                candidateId: candidateId,
                candidateName: fullName
            });
            setNewInterviewData(prev => ({
                ...prev,
                candidateEmployeeId: candidateId,
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
        // Find the selected service order to get the account name and CCA role
        const selectedServiceOrder = serviceOrders.find(order => order.serviceOrderId.toString() === serviceOrderId.toString());

        setNewInterviewData(prev => ({
            ...prev,
            serviceOrderId: serviceOrderId,
            accountName: selectedServiceOrder ? selectedServiceOrder.accountName : '',
            ccaRole: selectedServiceOrder ? selectedServiceOrder.ccaRole : ''
        }));

        // Fetch candidates and employees for the selected service order
        if (serviceOrderId && serviceOrderId !== '') {
            console.log('🔄 Fetching candidates and employees for service order:', serviceOrderId);
            fetchCandidates(serviceOrderId);
            fetchEmployees(serviceOrderId);
        } else {
            // If no service order selected, fetch all candidates and employees
            console.log('🔄 Fetching all candidates and employees (no service order filter)');
            fetchCandidates();
            fetchEmployees();
        }
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
            // Find the selected candidate and interviewer to get their IDs
            const selectedCandidate = candidates.find(candidate =>
                candidate.candidate_id.toString() === newInterviewData.candidateEmployeeId.toString()
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
                employee_id: selectedCandidate.candidate_id.toString(),
                cognizant_evaluator_id: selectedInterviewer.employee_id.toString(),
                evaluation_datetime: `${newInterviewData.date} ${newInterviewData.time}`,
                evaluation_type: newInterviewData.interviewType || "",
                final_status: "Scheduled"
            };

            console.log('Submitting interview to /evaluations API:', payload);

            // Call the /evaluations API
            const response = await fetch(`${API_BASE_URL}/evaluations`, {
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
                                            <button className="btn btn-primary" onClick={() => startInterview()}>Start Interview</button>
                                        ) : (
                                            <button className="btn btn-danger" onClick={() => stopInterview()}>Stop Interview</button>
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
                                                            <span className="date-time">📅 {candidate.evaluationDateTime || `${candidate.interviewDate} at ${candidate.interviewTime}`}</span>
                                                            <span className="interview-type">🎯 {candidate.evaluationType}</span>
                                                            <span className="duration">⏱️ {candidate.duration || '30 min'}</span>
                                                            <span className="interviewer">👤 {candidate.interviewerName}</span>
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
                                                        <span>📅 {selectedCandidateForEvaluation.evaluationDateTime || `${selectedCandidateForEvaluation.interviewDate} at ${selectedCandidateForEvaluation.interviewTime}`}</span>
                                                        <span>🎯 {selectedCandidateForEvaluation.evaluationType}</span>
                                                        <span>👤 {selectedCandidateForEvaluation.interviewerName}</span>
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
                                        <h3>Service Order Information</h3>
                                        <div className="form-group">
                                            <label>Service Order ID</label>
                                            {isLoadingServiceOrders ? (
                                                <div className="form-input" style={{ display: 'flex', alignItems: 'center', color: '#6c757d' }}>
                                                    <div className="loading-spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }}></div>
                                                    Loading service orders...
                                                </div>
                                            ) : serviceOrdersError ? (
                                                <div>
                                                    <select className="form-select" disabled>
                                                        <option>Failed to load service orders</option>
                                                    </select>
                                                    <small style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '4px', display: 'block' }}>
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
                                                style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                                            />
                                            <small style={{ color: '#6c757d', fontSize: '0.875rem', marginTop: '4px', display: 'block' }}>
                                                Account name is automatically filled when you select a service order above
                                            </small>
                                        </div>

                                        <div className="form-group">
                                            <label>CCA Role</label>
                                            <input
                                                type="text"
                                                placeholder="Auto-filled when service order is selected"
                                                className="form-input"
                                                value={newInterviewData.ccaRole}
                                                readOnly
                                                style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                                            />
                                            <small style={{ color: '#6c757d', fontSize: '0.875rem', marginTop: '4px', display: 'block' }}>
                                                CCA role is automatically filled when you select a service order above
                                            </small>
                                        </div>
                                    </div>

                                    <div className="form-section">
                                        <h3>Candidate Information</h3>
                                        <div className="form-group">
                                            <label>Candidate Name *</label>
                                            {!newInterviewData.serviceOrderId ? (
                                                <div className="form-input" style={{ display: 'flex', alignItems: 'center', color: '#6c757d' }}>
                                                    <span>Please select a Service Order first to load candidates</span>
                                                </div>
                                            ) : isLoadingCandidates ? (
                                                <div className="form-input" style={{ display: 'flex', alignItems: 'center', color: '#6c757d' }}>
                                                    <div className="loading-spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }}></div>
                                                    Loading candidates for service order {newInterviewData.serviceOrderId}...
                                                </div>
                                            ) : candidatesError ? (
                                                <div>
                                                    <select className="form-select" disabled>
                                                        <option>Failed to load candidates</option>
                                                    </select>
                                                    <small style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '4px', display: 'block' }}>
                                                        {candidatesError} - Using fallback data
                                                    </small>
                                                </div>
                                            ) : (
                                                <select
                                                    className="form-select"
                                                    value={newInterviewData.candidateEmployeeId}
                                                    onChange={(e) => handleCandidateSelection(e.target.value)}
                                                >
                                                    <option value="">
                                                        {candidates.length > 0 ? 'Select Candidate' : 'No candidates available for this service order'}
                                                    </option>
                                                    {candidates.map(candidate => (
                                                        <option key={candidate.candidate_id} value={candidate.candidate_id}>
                                                            {candidate.first_name} {candidate.last_name}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                            <small style={{ color: '#6c757d', fontSize: '0.875rem', marginTop: '4px', display: 'block' }}>
                                                Candidates are filtered based on the selected service order
                                            </small>
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
                                            {!newInterviewData.serviceOrderId ? (
                                                <div className="form-input" style={{ display: 'flex', alignItems: 'center', color: '#6c757d' }}>
                                                    <span>Please select a Service Order first to load interviewers</span>
                                                </div>
                                            ) : isLoadingEmployees ? (
                                                <div className="form-input" style={{ display: 'flex', alignItems: 'center', color: '#6c757d' }}>
                                                    <div className="loading-spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }}></div>
                                                    Loading interviewers for service order {newInterviewData.serviceOrderId}...
                                                </div>
                                            ) : employeesError ? (
                                                <div>
                                                    <select className="form-select" disabled>
                                                        <option>Failed to load interviewers</option>
                                                    </select>
                                                    <small style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '4px', display: 'block' }}>
                                                        {employeesError} - Using fallback data
                                                    </small>
                                                </div>
                                            ) : (
                                                <select
                                                    className="form-select"
                                                    value={newInterviewData.interviewer}
                                                    onChange={(e) => handleScheduleInputChange('interviewer', e.target.value)}
                                                >
                                                    <option value="">
                                                        {employees.length > 0 ? 'Select Interviewer' : 'No interviewers available for this service order'}
                                                    </option>
                                                    {employees.map(employee => (
                                                        <option key={employee.employee_id} value={employee.employee_id}>
                                                            {employee.first_name} {employee.last_name} - {employee.role || employee.department}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                            <small style={{ color: '#6c757d', fontSize: '0.875rem', marginTop: '4px', display: 'block' }}>
                                                Interviewers are filtered based on the selected service order
                                            </small>
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
                                                style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                                            />
                                            <small style={{ color: '#6c757d', fontSize: '0.875rem', marginTop: '4px', display: 'block' }}>
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
                                                            <span className="service-order">📋 Service Order: {interview.serviceOrderId || 'N/A'}</span>
                                                            <span className="interviewer">👤 {interview.interviewerName || interview.interviewer} (ID: {interview.cognizantInterviewer1ID})</span>
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
                                                            <span className="date-time">📅 {interview.evaluationDateTime || `${interview.date} at ${interview.time}`}</span>
                                                            <span className="interview-type">🎯 {interview.evaluationType}</span>
                                                            <span className="duration">⏱️ {interview.evaluationDuration || interview.duration || '30 min'}</span>
                                                            <div className="rating">
                                                                <span className="stars">
                                                                    {(() => {
                                                                        const calculatedRating = calculateAverageRating(interview.evaluationFeedback) || interview.rating || 0;
                                                                        return Array.from({ length: 5 }, (_, i) => (
                                                                            <span key={i} className={i < Math.floor(calculatedRating) ? 'star filled' : 'star empty'}>
                                                                                {i < Math.floor(calculatedRating) ? '⭐' : '☆'}
                                                                            </span>
                                                                        ));
                                                                    })()}
                                                                </span>
                                                                <span className="rating-value">{calculateAverageRating(interview.evaluationFeedback) || interview.rating || 0}/5</span>
                                                            </div>
                                                            <span className={`status ${(interview.finalStatus || interview.status) ? (interview.finalStatus || interview.status).replace(' ', '-') : ''}`}>
                                                                {(() => {
                                                                    const displayStatus = interview.finalStatus || interview.status;
                                                                    if (displayStatus === 'Selected' || displayStatus === 'Hired') return '🎉';
                                                                    if (displayStatus === 'Hold' || displayStatus === 'Under Review') return '⏸️';
                                                                    if (displayStatus === 'Rejected') return '❌';
                                                                    return '📋';
                                                                })()} {interview.finalStatus || interview.status || 'Unknown'}
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
                                <h4>Question & Answer Analysis:</h4>
                                <div className="qa-content">
                                    {(() => {
                                        try {
                                            // Try to parse the data if it's a JSON string
                                            let parsedData = popupTranscriptData;
                                            if (typeof popupTranscriptData === 'string') {
                                                try {
                                                    parsedData = JSON.parse(popupTranscriptData);
                                                } catch (e) {
                                                    // If parsing fails, treat as plain text
                                                    return (
                                                        <div className="transcript-text">
                                                            <h5>Raw Transcript:</h5>
                                                            <pre>{popupTranscriptData}</pre>
                                                        </div>
                                                    );
                                                }
                                            }

                                            // If it's an array of Q&A objects
                                            if (Array.isArray(parsedData)) {
                                                return (
                                                    <div className="qa-list">
                                                        {parsedData.map((qa, index) => (
                                                            <div key={index} className="qa-item">
                                                                <div className="question-section">
                                                                    <h5>Question {index + 1}:</h5>
                                                                    <p className="question-text">{qa.question || 'Question not available'}</p>
                                                                </div>
                                                                <div className="answer-section">
                                                                    <h5>Answer:</h5>
                                                                    <p className="answer-text">{qa.answer || 'Answer not available'}</p>
                                                                </div>
                                                                {qa.isCorrect !== undefined && (
                                                                    <div className="correctness-section">
                                                                        <span className={`correctness-badge ${qa.isCorrect ? 'correct' : 'incorrect'}`}>
                                                                            {qa.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {qa.score !== undefined && (
                                                                    <div className="score-section">
                                                                        <span className="score-badge">Score: {qa.score}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                );
                                            }

                                            // If it's a single Q&A object
                                            if (parsedData && typeof parsedData === 'object' && (parsedData.question || parsedData.answer)) {
                                                return (
                                                    <div className="qa-list">
                                                        <div className="qa-item">
                                                            <div className="question-section">
                                                                <h5>Question:</h5>
                                                                <p className="question-text">{parsedData.question || 'Question not available'}</p>
                                                            </div>
                                                            <div className="answer-section">
                                                                <h5>Answer:</h5>
                                                                <p className="answer-text">{parsedData.answer || 'Answer not available'}</p>
                                                            </div>
                                                            {parsedData.isCorrect !== undefined && (
                                                                <div className="correctness-section">
                                                                    <span className={`correctness-badge ${parsedData.isCorrect ? 'correct' : 'incorrect'}`}>
                                                                        {parsedData.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {parsedData.score !== undefined && (
                                                                <div className="score-section">
                                                                    <span className="score-badge">Score: {parsedData.score}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            // Fallback for other object types
                                            return (
                                                <div className="transcript-text">
                                                    <h5>Analysis Data:</h5>
                                                    <pre>{JSON.stringify(parsedData, null, 2)}</pre>
                                                </div>
                                            );

                                        } catch (error) {
                                            console.error('Error parsing transcript data:', error);
                                            return (
                                                <div className="transcript-text">
                                                    <h5>Raw Data:</h5>
                                                    <pre>{typeof popupTranscriptData === 'string' ? popupTranscriptData : JSON.stringify(popupTranscriptData, null, 2)}</pre>
                                                </div>
                                            );
                                        }
                                    })()}
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