import React, { useState, useEffect } from 'react';
import './RegisterBox.css';
import axios from 'axios';

interface RegisterAdminBoxProps {
  onClose: () => void;
}

interface Admin {
  _id: string;
  username: string;
  email: string;
  role: string;
}

const RegisterAdminBox: React.FC<RegisterAdminBoxProps> = ({ onClose }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [admins, setAdmins] = useState<Admin[]>([]);

  // Fetch all admins
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/admins', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAdmins(response.data);
      } catch (err) {
        console.error('Failed to fetch admins:', err);
      }
    };

    fetchAdmins();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/admins/register',
        { username, email, password },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess('Admin registered successfully!');
      setUsername('');
      setEmail('');
      setPassword('');

      // Refresh the admin list
      const response = await axios.get('/api/admins', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAdmins(response.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      } else {
        setError('An unknown error occurred.');
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
        <div className="register-box">
          {/* Left Side: Registration Form */}
          <div className="register-box-left">
            <h2>Register New Admin</h2>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
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
              <button type="submit" className="register-button">
                Register
              </button>
            </form>
          </div>

          {/* Right Side: Admin List */}
          <div className="register-box-right">
            <h2>Existing Admins</h2>
            <ul className="admin-list">
              {admins.map((admin) => (
                <li key={admin._id}>
                  <strong>{admin.username}</strong> ({admin.email})
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterAdminBox;