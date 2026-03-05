import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/Login.module.css';

const Login = ({ isOpen, onClose, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 500);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setPassword('');
      setError('');
      setShowPassword(false);
      setRememberMe(false);
      setIsClosing(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && isOpen && !isClosing) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isOpen, isClosing, handleClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await login(email, password);
    
    if (result.success) {
      handleClose();
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isClosing) {
      handleClose();
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRegisterClick = (e) => {
    e.preventDefault();
    handleClose();
    setTimeout(() => {
      onSwitchToRegister();
    }, 500);
  };

  return (
    <div 
      className={`${styles.modalOverlay} ${isClosing ? styles.fadeOut : ''}`} 
      onClick={handleOverlayClick}
    >
      <div className={styles.modalContainer}>
        <button className={styles.closeButton} onClick={handleClose} aria-label="Close modal">
          ×
        </button>
        
        <div className={styles.welcomeContainer}>
          <h1 className={styles.welcomeTitle}>Welcome Back!</h1>
          <p className={styles.welcomeSubtitle}>Sign in to access your recipes</p>
        </div>
        
        <div className={styles.loginContainer}>
          
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
                className={`${styles.formInput} ${email ? styles.inputActive : ''}`}
                placeholder="Enter your email"
                required
                autoFocus
              />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Password</label>
              <div className={styles.passwordInputContainer}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${styles.passwordInput} ${password ? styles.passwordInputActive : ''}`}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "👁️" : "👁️"}
                </button>
              </div>
            </div>

            <div className={styles.formOptions}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className={styles.checkbox}
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className={styles.forgotLink}>
                Forgot Password?
              </Link>
            </div>
            
            <button type="submit" className={styles.submitButton}>
              Sign In
            </button>
          </form>

          <div className={styles.divider}>
            <hr className={styles.lineBreak}></hr>
            <p className={styles.registerLinkContainer}>or</p>
            <hr className={styles.lineBreak}></hr>
          </div>

          <p className={styles.registerLinkContainer}>
            Don't have an account?{' '}
            <button 
              onClick={handleRegisterClick}
              className={styles.registerLink}
            >
              Sign Up
            </button>
          </p>


        </div>
      </div>
    </div>
  );
};

export default Login;