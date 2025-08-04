import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const QuestionDetailPage = () => {
  const { id } = useParams();
  const [answerContent, setAnswerContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: question, isLoading: questionLoading } = useQuery(
    ['question', id],
    () => axios.get(`/questions/${id}`).then(res => res.data.question)
  );

  const { data: answers, isLoading: answersLoading } = useQuery(
    ['answers', id],
    () => axios.get(`/answers/questions/${id}/answers`).then(res => res.data.answers)
  );

  const createAnswerMutation = useMutation(
    (answerData) => axios.post(`/answers/questions/${id}/answers`, answerData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['answers', id]);
        setAnswerContent('');
      },
      onError: (error) => {
        setError(error.response?.data?.message || 'Failed to post answer');
      }
    }
  );

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError('Please login to post an answer');
      return;
    }

    if (!answerContent.trim()) {
      setError('Please enter your answer');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createAnswerMutation.mutateAsync({
        content: answerContent.trim()
      });
    } catch (error) {
      console.error('Error posting answer:', error);
    } finally {
      setLoading(false);
    }
  };

  if (questionLoading || answersLoading) {
    return <div className="loading">Loading question...</div>;
  }

  if (!question) {
    return (
      <div className="card">
        <h2>Question Not Found</h2>
        <p>The question you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/questions')} className="btn">
          Back to Questions
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Question */}
      <div className="question-card card">
        <h1>{question.title}</h1>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          {question.content}
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="user-avatar">
              {question.first_name?.charAt(0) || 'U'}
            </div>
            <div>
              <div style={{ fontWeight: '500' }}>
                {question.first_name} {question.last_name}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                {new Date(question.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>
              {question.view_count || 0} views
            </div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>
              {question.vote_count || 0} votes
            </div>
            <div>
              {question.tags && question.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Answers */}
      <div className="card">
        <h2>Answers ({answers?.length || 0})</h2>
        
        {answers && answers.length > 0 ? (
          answers.map(answer => (
            <div key={answer.id} className="answer-card card" style={{ marginBottom: '1rem' }}>
              <p style={{ marginBottom: '1rem' }}>{answer.content}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="user-avatar">
                    {answer.first_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div style={{ fontWeight: '500' }}>
                      {answer.first_name} {answer.last_name}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>
                      {new Date(answer.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No answers yet. Be the first to answer!</p>
          </div>
        )}
      </div>

      {/* Post Answer */}
      {isAuthenticated ? (
        <div className="card">
          <h3>Your Answer</h3>
          
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmitAnswer}>
            <div className="form-group">
              <textarea
                className="form-control"
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                placeholder="Write your answer here..."
                rows="6"
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                type="submit" 
                className="btn" 
                disabled={loading}
              >
                {loading ? 'Posting Answer...' : 'Post Answer'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="card">
          <h3>Login to Answer</h3>
          <p>Please login to post an answer to this question.</p>
          <button onClick={() => navigate('/login')} className="btn">
            Login
          </button>
        </div>
      )}

      {/* Back to Questions */}
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button onClick={() => navigate('/questions')} className="btn btn-secondary">
          Back to Questions
        </button>
      </div>
    </div>
  );
};

export default QuestionDetailPage; 