import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AuthGuard from './components/AuthGuard';
import Dashboard from './pages/Dashboard';
import UserDashboard from './pages/UserDashboard';
import ProcessPetition from './pages/ProcessPetition';
import ClaimsAnalysis from './pages/ClaimsAnalysis';
import EvidenceEvaluation from './pages/EvidenceEvaluation';
import ReportGeneration from './pages/ReportGeneration';
import { PetitionProvider } from './context/PetitionContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <PetitionProvider>
        <Router>
          <AuthGuard>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/user-dashboard" element={<UserDashboard />} />
                <Route path="/process" element={<ProcessPetition />} />
                <Route path="/claims" element={<ClaimsAnalysis />} />
                <Route path="/evidence" element={<EvidenceEvaluation />} />
                <Route path="/report" element={<ReportGeneration />} />
              </Routes>
            </Layout>
          </AuthGuard>
        </Router>
      </PetitionProvider>
    </AuthProvider>
  );
}

export default App;