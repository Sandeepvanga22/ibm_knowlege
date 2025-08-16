import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [ibmId, setIbmId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(ibmId, password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="card">
      <h2>Login to IBM Knowledge Ecosystem</h2>
      
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="ibmId">IBM ID</label>
          <input
            type="text"
            id="ibmId"
            className="form-control"
            value={ibmId}
            onChange={(e) => setIbmId(e.target.value)}
            placeholder="Enter your IBM ID"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>

        <button 
          type="submit" 
          className="btn" 
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '4px' }}>
        <h4>Valid Demo IBM IDs:</h4>
        <p><strong>EMP001</strong> - John Doe (Cloud Development, Watson AI)</p>
        <p><strong>EMP002</strong> - Jane Smith (Infrastructure, Red Hat)</p>
        <p><strong>EMP003</strong> - Mike Johnson (Security, Cyber Security)</p>
        <p><strong>EMP004</strong> - Sarah Wilson (Data Science, Analytics)</p>
        <p><strong>EMP005</strong> - David Brown (Platform Engineering, OpenShift)</p>
        <p><em>Use any password for demo purposes</em></p>
        <p><em>Only these IBM IDs are valid for login</em></p>
      </div>
    </div>
  );
};

export default LoginPage; 