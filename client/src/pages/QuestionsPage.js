import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { mockData } from '../utils/mockData';

const QuestionsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  // Debounce search term to avoid API calls on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: questions, isLoading } = useQuery(
    ['questions', debouncedSearchTerm, selectedTag],
    () => {
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      if (selectedTag) params.append('tag', selectedTag);
      return axios.get(`/questions?${params.toString()}`).then(res => res.data.questions);
    },
    {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      // Only show loading for initial load or when debounced term changes
      keepPreviousData: true,
    }
  );

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
  const questionsData = questions || mockData.questions;
  const tagsData = tags || mockData.tags;

  // Filter questions client-side for immediate feedback while typing
  const filteredQuestions = useMemo(() => {
    if (!searchTerm && !selectedTag) {
      return questionsData;
    }

    return questionsData.filter(question => {
      const matchesSearch = !searchTerm || 
        question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (question.tags && question.tags.some(tag => 
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ));
      
      const matchesTag = !selectedTag || 
        (question.tags && question.tags.includes(selectedTag));
      
      return matchesSearch && matchesTag;
    });
  }, [questionsData, searchTerm, selectedTag]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTag('');
  };

  // Only show loading for initial load, not for search
  const showLoading = isLoading && !questionsData.length;

  if (showLoading) {
    return (
      <div className="loading" style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Loading questions...</div>
        <div style={{ color: '#666' }}>Please wait while we fetch the questions</div>
      </div>
    );
  }

  return (
    <div>
      <h1>Questions</h1>

      {/* Search and Filters */}
      <div className="card">
        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <div style={{ 
              fontSize: '0.875rem', 
              color: '#666', 
              marginTop: '0.5rem',
              fontStyle: 'italic'
            }}>
              {searchTerm !== debouncedSearchTerm ? 'Searching...' : `Found ${filteredQuestions.length} results`}
            </div>
          )}
        </div>

        <div className="filters">
          <button
            className={`filter-btn ${selectedTag === '' ? 'active' : ''}`}
            onClick={() => setSelectedTag('')}
          >
            All Tags
          </button>
          {tagsData && tagsData.slice(0, 10).map(tag => (
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
        {filteredQuestions.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <h3>No questions found</h3>
            <p style={{ color: '#666' }}>
              {searchTerm || selectedTag 
                ? 'Try adjusting your search terms or filters' 
                : 'No questions have been posted yet'
              }
            </p>
          </div>
        ) : (
          <div className="questions-grid">
            {filteredQuestions.map(question => (
              <div key={question.id} className="question-card">
                <h3>
                  <Link to={`/questions/${question.id}`}>
                    {question.title}
                  </Link>
                </h3>
                <p>{question.content.substring(0, 150)}...</p>
                <div className="question-meta">
                  <span>By {question.first_name} {question.last_name}</span>
                  <span>{new Date(question.created_at).toLocaleDateString()}</span>
                </div>
                <div className="question-tags">
                  {question.tags && question.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                  {question.tags && question.tags.length > 3 && (
                    <span className="tag">+{question.tags.length - 3} more</span>
                  )}
                </div>
              </div>
            ))}
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