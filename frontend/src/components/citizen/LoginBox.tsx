import React, { useState } from 'react';
import './LoginBox.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface LoginBoxProps {
  onClose: () => void;
}

const LoginBox: React.FC<LoginBoxProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('/api/admins/login', { email, password });
      const { token } = response.data;

      // we store the token securely in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('role', 'admin'); // Assuming role is admin

      // token and role are successfully stored before navigating
      navigate('/authority/dashboard'); // Drectly navigate after storing the token
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      } else {
        setError('An unknown error occurred.');
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>✕</button>
        <h2>Admin Login</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">Login</button>
        </form>
      </div>
    </div>
  );
};

export default LoginBox;
