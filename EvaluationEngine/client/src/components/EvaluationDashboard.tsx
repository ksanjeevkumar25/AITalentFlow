import React from 'react';
import RegisterScreen from '../RegisterScreen.tsx';
import EvaluationScreen from '../EvaluationScreen.tsx';

interface EvaluationDashboardProps {
  userEmail: string;
  evaluationInfo: any;
  onStartEvaluation: (info: any) => void;
  onFinishEvaluation: (score: number) => void;
  onLogout: () => void;
}

const EvaluationDashboard: React.FC<EvaluationDashboardProps> = ({
  userEmail,
  evaluationInfo,
  onStartEvaluation,
  onFinishEvaluation,
  onLogout
}) => {
  // If evaluation is in progress, show evaluation screen
  if (evaluationInfo) {
    return (
      <EvaluationScreen
        candidateId={evaluationInfo.candidateId}
        skill={evaluationInfo.skill}
        expertLevel={evaluationInfo.expertLevel}
        questionCount={evaluationInfo.questionCount}
        name={evaluationInfo.name}
        initialQuestion={evaluationInfo.initialQuestion}
        onFinish={onFinishEvaluation}
        onLogout={onLogout}
      />
    );
  }

  // Otherwise show registration/dashboard screen
  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <h2 style={titleStyles}>Evaluation Dashboard</h2>
        <p style={subtitleStyles}>Manage and take skill evaluations</p>
      </div>
      
      <div style={contentStyles}>
        <RegisterScreen 
          email={userEmail} 
          onStartEvaluation={onStartEvaluation} 
        />
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
  marginBottom: '2rem',
  textAlign: 'center' as const
};

const titleStyles: React.CSSProperties = {
  color: '#1e293b',
  margin: '0 0 0.5rem 0',
  fontSize: '2rem',
  fontWeight: 'bold'
};

const subtitleStyles: React.CSSProperties = {
  color: '#6b7280',
  margin: 0,
  fontSize: '1.1rem'
};

const contentStyles: React.CSSProperties = {
  maxWidth: '800px',
  margin: '0 auto'
};

export default EvaluationDashboard;
