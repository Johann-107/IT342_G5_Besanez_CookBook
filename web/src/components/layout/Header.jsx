import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/Header.module.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <nav className={styles.headerNav}>
        <Link to="/" className={styles.headerBrand}>
          MyApp
        </Link>
        
        <div className={styles.headerMenu}>
          {user ? (
            <>
              <Link to="/dashboard" className={styles.navLink}>
                Dashboard
              </Link>
              <Link to="/profile" className={styles.navLink}>
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className={styles.logoutButton}
              >
                Logout
              </button>
              <span className={styles.userWelcome}>
                Welcome, {user.name}
              </span>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.navLink}>
                Login
              </Link>
              <Link 
                to="/register" 
                className={styles.signupButton}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;