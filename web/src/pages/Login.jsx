import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await login(email, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="container">
        <div className="welcome-container">
            <h1 className="welcome-title">Welcome Back!</h1>
            <p className="welcome-subtitle">Please login to your account</p>
        </div>
        <div className="login-container">
        <h2 className="login-title">Login Account</h2>
        
        {error && (
            <div className="error-message">
            {error}
            </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
            <label className="form-label">Email</label>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
            />
            </div>
            
            <div className="form-group">
            <label className="form-label">Password</label>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
            />
            </div>
            
            <button
            type="submit"
            className="submit-button"
            >
            Login
            </button>
        </form>
        
        <p className="register-link-container">
            Don't have an account?{' '}
            <Link to="/register" className="register-link">
            Register here
            </Link>
        </p>
        </div>
    </div>
  );
};

export default Login;