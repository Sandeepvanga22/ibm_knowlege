import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { mockData } from '../utils/mockData';

const HomePage = () => {
  const { data: dashboard, isLoading: dashboardLoading } = useQuery(
    'dashboard',
    () => axios.get('/analytics/dashboard').then(res => res.data.dashboard),
    {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const { data: questions, isLoading: questionsLoading } = useQuery(
    'recent-questions',
    () => axios.get('/questions?limit=5').then(res => res.data.questions),
    {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const { data: users, isLoading: usersLoading } = useQuery(
    'users',
    () => axios.get('/users').then(res => res.data.users),
    {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Use mock data as fallback
  const dashboardData = dashboard || mockData.dashboard;
  const questionsData = questions || mockData.questions.slice(0, 5);
  const usersData = users || mockData.users;

  if (dashboardLoading || questionsLoading || usersLoading) {
    return (
      <div className="loading" style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Loading dashboard...</div>
        <div style={{ color: '#666' }}>Please wait while we fetch the latest data</div>
      </div>
    );
  }

  return (
    <div>
      <h1>IBM Knowledge Ecosystem</h1>
      <p>Welcome to the intelligent Q&A platform with agent-powered routing and duplicate detection.</p>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{dashboardData?.counts?.total_users || 0}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{dashboardData?.counts?.total_questions || 0}</div>
          <div className="stat-label">Total Questions</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{dashboardData?.counts?.total_answers || 0}</div>
          <div className="stat-label">Total Answers</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{usersData?.length || 0}</div>
          <div className="stat-label">Active Users</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/ask" className="btn">
            Ask a Question
          </Link>
          <Link to="/questions" className="btn btn-secondary">
            Browse Questions
          </Link>
          <Link to="/analytics" className="btn btn-secondary">
            View Analytics
          </Link>
          <Link to="/agents" className="btn btn-secondary">
            Agent Performance
          </Link>
        </div>
      </div>

      {/* Recent Questions */}
      <div className="card">
        <h3>Recent Questions</h3>
        {questionsData && questionsData.length > 0 ? (
          <div>
            {questionsData.slice(0, 5).map(question => (
              <div key={question.id} className="question-card card" style={{ marginBottom: '1rem' }}>
                <h4>
                  <Link to={`/questions/${question.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {question.title}
                  </Link>
                </h4>
                <p style={{ color: '#666', marginBottom: '0.5rem' }}>
                  {question.content.substring(0, 150)}...
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.875rem', color: '#666' }}>
                      By {question.first_name} {question.last_name}
                    </span>
                    <span style={{ marginLeft: '1rem', fontSize: '0.875rem', color: '#666' }}>
                      {new Date(question.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    {question.tags && question.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Link to="/questions" className="btn btn-secondary">
                View All Questions
              </Link>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <p>No questions yet. Be the first to ask!</p>
            <Link to="/ask" className="btn">
              Ask a Question
            </Link>
          </div>
        )}
      </div>

      {/* Agent Status */}
      <div className="card">
        <h3>Agent Framework Status</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#e8f5e8', borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#24a148' }}>Smart Routing Agent</h4>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>Ready for expert suggestions</p>
          </div>
          <div style={{ padding: '1rem', background: '#e8f5e8', borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#24a148' }}>Duplicate Detection Agent</h4>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>Ready for similarity analysis</p>
          </div>
          <div style={{ padding: '1rem', background: '#e8f5e8', borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#24a148' }}>Knowledge Gap Agent</h4>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>Ready for gap identification</p>
          </div>
          <div style={{ padding: '1rem', background: '#e8f5e8', borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#24a148' }}>Expertise Discovery Agent</h4>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>Ready for skill mapping</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 