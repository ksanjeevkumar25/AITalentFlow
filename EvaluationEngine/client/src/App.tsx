import React, { useState } from 'react';
import axios from 'axios';
import Login from './Login.tsx';
import Navigation from './components/Navigation.tsx';
import EvaluationDashboard from './components/EvaluationDashboard.tsx';
import ServiceOrders from './components/ServiceOrders.tsx';
import PriorityMatchingList from './components/PriorityMatchingList.tsx';
import ManageServiceOrders from './components/ManageServiceOrders.tsx';
import { updateEmployeeSkill } from './updateEmployeeSkill.ts';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [evaluationInfo, setEvaluationInfo] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [remarks, setRemarks] = useState('');
  const [currentPage, setCurrentPage] = useState('evaluation-dashboard');

  const handleLogin = async (email: string, password: string) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const response = await axios.post(`${apiUrl}/login`, { email, password });
      if (response.data.success) {
        setIsLoggedIn(true);
        setLoginEmail(email);
      } else {
        return response.data.message || 'Login failed';
      }
    } catch (err: any) {
      console.log(err.response);
      return err.response?.data?.message || 'Login failed';
    }
    return null;
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginEmail('');
    setEvaluationInfo(null);
    setShowResult(false);
    setScore(null);
    setRemarks('');
    setCurrentPage('evaluation-dashboard');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    // Reset evaluation state when navigating away from evaluation dashboard
    if (page !== 'evaluation-dashboard') {
      setEvaluationInfo(null);
      setShowResult(false);
    }
  };

  const handleFinishEvaluation = async (finalScore: number) => {
    // Generate remarks based on score
    let remarks = '';
    if (finalScore >= 90) remarks = `Excellent ${evaluationInfo.skill} proficiency.`;
    else if (finalScore >= 75) remarks = `Strong ${evaluationInfo.skill} fundamentals.`;
    else if (finalScore >= 60) remarks = `Good ${evaluationInfo.skill} skills.`;
    else if (finalScore >= 40) remarks = `Basic ${evaluationInfo.skill} understanding.`;
    else remarks = `Needs improvement in ${evaluationInfo.skill}.`;

    // Save last score for cool-off logic
    localStorage.setItem(`eval_last_score_${loginEmail}_${evaluationInfo.skill}`, String(finalScore));

    try {
      await updateEmployeeSkill({
        candidateId: evaluationInfo.candidateId,
        skill: evaluationInfo.skill,
        score: finalScore,
        remarks
      });
    } catch (e) {
      // Optionally handle error (e.g., show a message)
      console.error('Failed to update employee skill:', e);
    }
    setScore(finalScore);
    setRemarks(remarks);
    setShowResult(true);
    setEvaluationInfo(null);
  };

  // If not logged in, show login screen
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  // If showing result screen after evaluation
  if (showResult) {
    return (
      <div>
        <Navigation 
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          userEmail={loginEmail}
        />
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(120deg, #e0e7ff 0%, #f8fafc 100%)' }}>
          <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px 0 rgba(80,80,180,0.10)', padding: 40, textAlign: 'center', minWidth: 350 }}>
            <h2 style={{ color: '#3b3b7a' }}>Evaluation Complete!</h2>
            <p style={{ fontSize: 20, margin: '18px 0' }}>Your Score: <b>{score}</b></p>
            <p style={{ fontSize: 17, margin: '10px 0', color: '#6366f1' }}>{remarks}</p>
            <button onClick={() => { setShowResult(false); }} style={{ marginRight: 16 }}>Back to Dashboard</button>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>
    );
  }

  // Main application with navigation
  return (
    <div>
      <Navigation 
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        userEmail={loginEmail}
      />
      
      {currentPage === 'evaluation-dashboard' && (
        <EvaluationDashboard
          userEmail={loginEmail}
          evaluationInfo={evaluationInfo}
          onStartEvaluation={setEvaluationInfo}
          onFinishEvaluation={handleFinishEvaluation}
          onLogout={handleLogout}
        />
      )}
      
      {currentPage === 'priority-matching' && (
        <PriorityMatchingList userEmail={loginEmail} />
      )}
      
      {currentPage === 'service-orders' && (
        <ServiceOrders userEmail={loginEmail} />
      )}
      
      {currentPage === 'manage-service-orders' && (
        <ManageServiceOrders userEmail={loginEmail} />
      )}
    </div>
  );
}


export default App;
