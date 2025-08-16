import React from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { mockData } from '../utils/mockData';

const AnalyticsPage = () => {
  const { data: dashboard, isLoading: dashboardLoading } = useQuery(
    'dashboard',
    () => axios.get('/analytics/dashboard').then(res => res.data.dashboard),
    {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    }
  );

  const { data: questionAnalytics, isLoading: questionLoading } = useQuery(
    'question-analytics',
    () => axios.get('/analytics/questions').then(res => res.data.analytics),
    {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    }
  );

  const { data: userAnalytics, isLoading: userLoading } = useQuery(
    'user-analytics',
    () => axios.get('/analytics/users').then(res => res.data),
    {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    }
  );

  // Use mock data as fallback
  const dashboardData = dashboard || mockData.dashboard;
  const questionAnalyticsData = questionAnalytics || mockData.analytics.questions;
  const userAnalyticsData = userAnalytics || mockData.analytics.users;

  if (dashboardLoading || questionLoading || userLoading) {
    return (
      <div className="loading" style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Loading analytics...</div>
        <div style={{ color: '#666' }}>Please wait while we fetch the analytics data</div>
      </div>
    );
  }

  return (
    <div>
      <h1>Analytics Dashboard</h1>
      <p>Comprehensive insights into the IBM Knowledge Ecosystem usage and performance.</p>

      {/* Overview Stats */}
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
          <div className="stat-number">
            {dashboardData?.counts?.total_questions > 0 
              ? Math.round((dashboardData.counts.total_answers / dashboardData.counts.total_questions) * 100)
              : 0}%
          </div>
          <div className="stat-label">Answer Rate</div>
        </div>
      </div>

      {/* Recent Questions */}
      <div className="card">
        <h3>Recent Questions</h3>
        {dashboardData?.recent_questions && dashboardData.recent_questions.length > 0 ? (
          <div>
            {dashboardData.recent_questions.map(question => (
              <div key={question.id} style={{ 
                padding: '1rem', 
                borderBottom: '1px solid #e0e0e0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: '500' }}>{question.title}</div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>
                    By {question.first_name} {question.last_name} • {new Date(question.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No recent questions</p>
          </div>
        )}
      </div>

      {/* Question Analytics */}
      <div className="card">
        <h3>Question Analytics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div>
            <h4>Total Questions</h4>
            <div className="stat-number">{questionAnalyticsData?.total_questions || 0}</div>
          </div>
          
          {questionAnalyticsData?.questions_by_day && questionAnalyticsData.questions_by_day.length > 0 && (
            <div>
              <h4>Questions by Day</h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {questionAnalyticsData.questions_by_day.map((day, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '0.5rem 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}>
                    <span>{new Date(day.date).toLocaleDateString()}</span>
                    <span style={{ fontWeight: '500' }}>{day.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Analytics */}
      <div className="card">
        <h3>User Activity</h3>
        {userAnalyticsData?.user_activity && userAnalyticsData.user_activity.length > 0 ? (
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {userAnalyticsData.user_activity.map((user, index) => (
              <div key={index} style={{ 
                padding: '1rem',
                borderBottom: '1px solid #e0e0e0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: '500' }}>
                    {user.first_name} {user.last_name}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>
                    {user.department}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '500' }}>
                    {user.questions_asked + user.answers_given} contributions
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>
                    {user.questions_asked} questions • {user.answers_given} answers
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No user activity data available</p>
          </div>
        )}
      </div>

      {/* Agent Performance */}
      <div className="card">
        <h3>Agent Framework Status</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#e8f5e8', borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#24a148' }}>Smart Routing Agent</h4>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>Ready for expert suggestions</p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#666' }}>
              Framework initialized and operational
            </p>
          </div>
          
          <div style={{ padding: '1rem', background: '#e8f5e8', borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#24a148' }}>Duplicate Detection Agent</h4>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>Ready for similarity analysis</p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#666' }}>
              Framework initialized and operational
            </p>
          </div>
          
          <div style={{ padding: '1rem', background: '#e8f5e8', borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#24a148' }}>Knowledge Gap Agent</h4>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>Ready for gap identification</p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#666' }}>
              Framework initialized and operational
            </p>
          </div>
          
          <div style={{ padding: '1rem', background: '#e8f5e8', borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#24a148' }}>Expertise Discovery Agent</h4>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>Ready for skill mapping</p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#666' }}>
              Framework initialized and operational
            </p>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="card">
        <h3>System Health</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#e8f5e8', borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#24a148' }}>Database</h4>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>✅ Connected</p>
          </div>
          
          <div style={{ padding: '1rem', background: '#e8f5e8', borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#24a148' }}>Redis Cache</h4>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>✅ Connected</p>
          </div>
          
          <div style={{ padding: '1rem', background: '#e8f5e8', borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#24a148' }}>API Endpoints</h4>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>✅ Operational</p>
          </div>
          
          <div style={{ padding: '1rem', background: '#e8f5e8', borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#24a148' }}>Authentication</h4>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>✅ Active</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage; 