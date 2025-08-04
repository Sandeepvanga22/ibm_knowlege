import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const AskQuestionPage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: tags } = useQuery(
    'tags',
    () => axios.get('/tags').then(res => res.data.tags)
  );

  const createQuestionMutation = useMutation(
    (questionData) => axios.post('/questions', questionData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('questions');
        queryClient.invalidateQueries('dashboard');
        navigate('/questions');
      },
      onError: (error) => {
        setError(error.response?.data?.message || 'Failed to create question');
      }
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError('Please login to ask a question');
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createQuestionMutation.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        tags: selectedTags
      });
    } catch (error) {
      console.error('Error creating question:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTagToggle = (tagName) => {
    setSelectedTags(prev => 
      prev.includes(tagName)
        ? prev.filter(tag => tag !== tagName)
        : [...prev, tagName]
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="card">
        <h2>Login Required</h2>
        <p>Please login to ask a question.</p>
        <button onClick={() => navigate('/login')} className="btn">
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>Ask a Question</h1>
      
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label htmlFor="title">Question Title *</label>
          <input
            type="text"
            id="title"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's your question? Be specific."
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Question Details *</label>
          <textarea
            id="content"
            className="form-control"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Provide more details about your question. Include any relevant context, code snippets, or error messages."
            rows="6"
            required
          />
        </div>

        <div className="form-group">
          <label>Tags</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {tags && tags.map(tag => (
              <button
                key={tag.id}
                type="button"
                className={`tag ${selectedTags.includes(tag.name) ? 'selected' : ''}`}
                onClick={() => handleTagToggle(tag.name)}
                style={{
                  background: selectedTags.includes(tag.name) ? 'var(--ibm-blue)' : 'var(--ibm-light-gray)',
                  color: selectedTags.includes(tag.name) ? 'white' : 'var(--ibm-gray)',
                  cursor: 'pointer'
                }}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button 
            type="submit" 
            className="btn" 
            disabled={loading}
          >
            {loading ? 'Posting Question...' : 'Post Question'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate('/questions')}
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Tips */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3>Tips for a Great Question</h3>
        <ul>
          <li>Be specific and clear about what you're asking</li>
          <li>Include relevant context and background information</li>
          <li>If it's a technical question, include code snippets</li>
          <li>Add appropriate tags to help others find your question</li>
          <li>Check if a similar question has already been asked</li>
        </ul>
      </div>
    </div>
  );
};

export default AskQuestionPage; 