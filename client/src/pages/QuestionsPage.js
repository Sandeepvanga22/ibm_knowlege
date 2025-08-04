import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import axios from 'axios';

const QuestionsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const { data: questions, isLoading } = useQuery(
    ['questions', searchTerm, selectedTag],
    () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedTag) params.append('tag', selectedTag);
      return axios.get(`/questions?${params.toString()}`).then(res => res.data.questions);
    }
  );

  const { data: tags } = useQuery(
    'tags',
    () => axios.get('/tags').then(res => res.data.tags)
  );

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by the query
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTag('');
  };

  if (isLoading) {
    return <div className="loading">Loading questions...</div>;
  }

  return (
    <div>
      <h1>Questions</h1>

      {/* Search and Filters */}
      <div className="card">
        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>

        <div className="filters">
          <button
            className={`filter-btn ${selectedTag === '' ? 'active' : ''}`}
            onClick={() => setSelectedTag('')}
          >
            All Tags
          </button>
          {tags && tags.slice(0, 10).map(tag => (
            <button
              key={tag.id}
              className={`filter-btn ${selectedTag === tag.name ? 'active' : ''}`}
              onClick={() => setSelectedTag(tag.name)}
            >
              {tag.name}
            </button>
          ))}
          {(searchTerm || selectedTag) && (
            <button onClick={clearFilters} className="btn btn-secondary">
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Questions List */}
      <div>
        {questions && questions.length > 0 ? (
          questions.map(question => (
            <div key={question.id} className="question-card card">
              <h3>
                <Link to={`/questions/${question.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {question.title}
                </Link>
              </h3>
              <p style={{ color: '#666', marginBottom: '1rem' }}>
                {question.content.substring(0, 200)}...
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
          ))
        ) : (
          <div className="empty-state">
            <p>No questions found.</p>
            <Link to="/ask" className="btn">
              Ask a Question
            </Link>
          </div>
        )}
      </div>

      {/* Ask Question CTA */}
      <div className="card" style={{ textAlign: 'center', marginTop: '2rem' }}>
        <h3>Can't find what you're looking for?</h3>
        <p>Ask a new question and get help from the IBM community.</p>
        <Link to="/ask" className="btn">
          Ask a Question
        </Link>
      </div>
    </div>
  );
};

export default QuestionsPage; 