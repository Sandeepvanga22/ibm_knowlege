import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { mockData } from '../utils/mockData';

const AskQuestionPage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAgentAnalysis, setShowAgentAnalysis] = useState(false);
  const [agentResults, setAgentResults] = useState({});
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: tags } = useQuery(
    'tags',
    () => axios.get('/tags').then(res => res.data.tags),
    {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    }
  );

  // Use mock data as fallback
  const tagsData = tags || mockData.tags;

  const createQuestionMutation = useMutation(
    (questionData) => axios.post('/questions', questionData),
    {
      onSuccess: (data, questionData) => {
        // Invalidate all questions queries to refresh the data
        queryClient.invalidateQueries(['questions']);
        queryClient.invalidateQueries('dashboard');
        queryClient.invalidateQueries('recent-questions');
        
        // Trigger agent analysis with the posted question
        triggerAgentAnalysis(questionData);
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

  const triggerAgentAnalysis = async (questionData) => {
    setAnalysisLoading(true);
    const agents = ['smartRouting', 'duplicateDetection', 'knowledgeGap', 'expertiseDiscovery'];
    const results = {};

    try {
      // Test all agents with the posted question
      for (const agentId of agents) {
        const response = await axios.get(`/agents/test/${agentId}`);
        results[agentId] = response.data;
      }
      
      setAgentResults(results);
      setShowAgentAnalysis(true);
    } catch (error) {
      console.error('Error triggering agent analysis:', error);
    } finally {
      setAnalysisLoading(false);
    }
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
            {tagsData && tagsData.map(tag => (
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

      {/* Agent Analysis Section */}
      {analysisLoading && (
        <div className="card" style={{ marginTop: '2rem', textAlign: 'center' }}>
          <h3>🤖 AI Agents Analyzing Your Question...</h3>
          <div style={{ padding: '2rem' }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Processing with all four AI agents</div>
            <div style={{ color: '#666' }}>Please wait while our intelligent agents analyze your question</div>
          </div>
        </div>
      )}

      {showAgentAnalysis && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <h3>🤖 AI Agent Analysis Results</h3>
          <p style={{ marginBottom: '1.5rem', color: '#666' }}>
            Our intelligent agents have analyzed your question and provided recommendations:
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {/* Smart Routing Agent */}
            {agentResults.smartRouting && (
              <div style={{ padding: '1.5rem', border: '2px solid #24a148', borderRadius: '8px', background: '#f8fff8' }}>
                <h4 style={{ color: '#24a148', marginBottom: '1rem' }}>🎯 Smart Routing Agent</h4>
                <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                  <p><strong>Analysis:</strong> {agentResults.smartRouting.result.analysis.analysis}</p>
                  <p><strong>Routing:</strong> {agentResults.smartRouting.result.analysis.routing}</p>
                  <p><strong>Confidence:</strong> {agentResults.smartRouting.result.analysis.confidence}</p>
                  <p><strong>Expert:</strong> {agentResults.smartRouting.result.analysis.expert}</p>
                  <p><strong>Recommendation:</strong> {agentResults.smartRouting.result.analysis.recommendation}</p>
                </div>
              </div>
            )}

            {/* Duplicate Detection Agent */}
            {agentResults.duplicateDetection && (
              <div style={{ padding: '1.5rem', border: '2px solid #da1e28', borderRadius: '8px', background: '#fff8f8' }}>
                <h4 style={{ color: '#da1e28', marginBottom: '1rem' }}>🔍 Duplicate Detection Agent</h4>
                <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                  <p><strong>Analysis:</strong> {agentResults.duplicateDetection.result.analysis.analysis}</p>
                  <p><strong>Duplicates:</strong> {agentResults.duplicateDetection.result.analysis.duplicates}</p>
                  <p><strong>Similarity:</strong> {agentResults.duplicateDetection.result.analysis.similarity}</p>
                  <p><strong>Recommendation:</strong> {agentResults.duplicateDetection.result.analysis.recommendation}</p>
                </div>
              </div>
            )}

            {/* Knowledge Gap Agent */}
            {agentResults.knowledgeGap && (
              <div style={{ padding: '1.5rem', border: '2px solid #f1c21b', borderRadius: '8px', background: '#fffef8' }}>
                <h4 style={{ color: '#f1c21b', marginBottom: '1rem' }}>📚 Knowledge Gap Agent</h4>
                <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                  <p><strong>Analysis:</strong> {agentResults.knowledgeGap.result.analysis.analysis}</p>
                  <p><strong>Gap:</strong> {agentResults.knowledgeGap.result.analysis.gap}</p>
                  <p><strong>Priority:</strong> {agentResults.knowledgeGap.result.analysis.priority}</p>
                  <p><strong>Recommendation:</strong> {agentResults.knowledgeGap.result.analysis.recommendation}</p>
                </div>
              </div>
            )}

            {/* Expertise Discovery Agent */}
            {agentResults.expertiseDiscovery && (
              <div style={{ padding: '1.5rem', border: '2px solid #6929c4', borderRadius: '8px', background: '#f8f8ff' }}>
                <h4 style={{ color: '#6929c4', marginBottom: '1rem' }}>👥 Expertise Discovery Agent</h4>
                <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                  <p><strong>Analysis:</strong> {agentResults.expertiseDiscovery.result.analysis.analysis}</p>
                  <p><strong>Expert:</strong> {agentResults.expertiseDiscovery.result.analysis.expert}</p>
                  <p><strong>Expertise Level:</strong> {agentResults.expertiseDiscovery.result.analysis.expertise}</p>
                  <p><strong>Confidence:</strong> {agentResults.expertiseDiscovery.result.analysis.confidence}</p>
                  <p><strong>Recommendation:</strong> {agentResults.expertiseDiscovery.result.analysis.recommendation}</p>
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button 
              onClick={() => navigate('/questions')} 
              className="btn"
              style={{ marginRight: '1rem' }}
            >
              View All Questions
            </button>
            <button 
              onClick={() => {
                setShowAgentAnalysis(false);
                setAgentResults({});
                setTitle('');
                setContent('');
                setSelectedTags([]);
              }} 
              className="btn btn-secondary"
            >
              Ask Another Question
            </button>
          </div>
        </div>
      )}

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