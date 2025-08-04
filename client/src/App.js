import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import QuestionsPage from './pages/QuestionsPage';
import AskQuestionPage from './pages/AskQuestionPage';
import QuestionDetailPage from './pages/QuestionDetailPage';
import LoginPage from './pages/LoginPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AgentPerformancePage from './pages/AgentPerformancePage';
import { AuthProvider } from './contexts/AuthContext';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="App">
          <Header />
          <main className="main-content">
            <div className="container">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/questions" element={<QuestionsPage />} />
                <Route path="/ask" element={<AskQuestionPage />} />
                <Route path="/questions/:id" element={<QuestionDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/agents" element={<AgentPerformancePage />} />
              </Routes>
            </div>
          </main>
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App; 