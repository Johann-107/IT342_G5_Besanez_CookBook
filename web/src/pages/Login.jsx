import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/Login.module.css';

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
    <div className={styles.container}>
        <div className={styles.welcomeContainer}>
            <h1 className={styles.welcomeTitle}>Welcome Back!</h1>
            <p className={styles.welcomeSubtitle}>Please login to your account</p>
        </div>
        <div className={styles.loginContainer}>
        <h2 className={styles.loginTitle}>Login Account</h2>
        
        {error && (
            <div className={styles.errorMessage}>
            {error}
            </div>
        )}
        
        <form onSubmit={handleSubmit} className={styles.loginForm}>
            <div className={styles.formGroup}>
            <label className={styles.formLabel}>Email</label>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.formInput}
                required
            />
            </div>
            
            <div className={styles.formGroup}>
            <label className={styles.formLabel}>Password</label>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.formInput}
                required
            />
            </div>
            
            <button
            type="submit"
            className={styles.submitButton}
            >
            Login
            </button>
        </form>
        
        <p className={styles.registerLinkContainer}>
            Don't have an account?{' '}
            <Link to="/register" className={styles.registerLink}>
            Register here
            </Link>
        </p>
        </div>
    </div>
  );
};

export default Login;