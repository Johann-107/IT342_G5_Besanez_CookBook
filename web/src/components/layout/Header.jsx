import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/Header.module.css';
import { useState } from 'react';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Check if current path is landing page
  const isLandingPage = location.pathname === '';

  // Check if current path is admin
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <header className={`${styles.header} ${isAdmin ? styles.headerAdmin : ''}`}>
      <nav className={styles.headerNav}>
        <Link to="/" className={styles.headerBrand}>
          <div className={styles.logoIcon}>🍳</div>
          <span className={styles.logoText}>CookBook</span>
          {isAdmin && <span className={styles.adminBadge}>Admin</span>}
        </Link>

        {isLandingPage && !user && (
          <ul className={styles.navLinks}>
            <li>
              <Link to="/#features" className={styles.navLink}>Features</Link>
            </li>
            <li>
              <Link to="/login" className={styles.navLink}>Login</Link>
            </li>
            <li>
              <Link to="/register" className={styles.highlightedLink}>Sign Up</Link>
            </li>
          </ul>
        )}

        {user && location.pathname === '/dashboard' && (
          <form className={styles.searchBar} onSubmit={handleSearch}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search recipes…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </form>
        )}

        <div className={styles.headerMenu}>
          {user ? (
            <>
              {!isAdmin && (
                <>
                  <Link to="/dashboard" className={styles.navLink}>
                    Dashboard
                  </Link>
                  <Link to="/collections" className={styles.navLink}>
                    Collections
                  </Link>
                  <Link to="/profile" className={styles.navLink}>
                    Profile
                  </Link>
                </>
              )}
              
              {isAdmin && (
                <>
                  <Link to="/admin" className={styles.navLink}>
                    Dashboard
                  </Link>
                  <Link to="/admin/users" className={styles.navLink}>
                    Users
                  </Link>
                  <Link to="/admin/recipes" className={styles.navLink}>
                    Recipes
                  </Link>
                </>
              )}

              <div className={styles.userSection}>
                <span className={styles.userWelcome}>
                  Welcome, {user.name?.split(' ')[0] || 'User'}
                </span>
                <div 
                  className={styles.avatar} 
                  onClick={() => navigate('/profile')}
                  title={user.name}
                >
                  {getInitials(user.name)}
                </div>
                <button
                  onClick={handleLogout}
                  className={styles.logoutButton}
                  aria-label="Logout"
                >
                  <span className={styles.logoutIcon}>🚪</span>
                </button>
              </div>
            </>
          ) : (
            <div className={styles.authButtons}>
              <Link to="/login" className={styles.navLink}>
                Login
              </Link>
              <Link 
                to="/register" 
                className={styles.signupButton}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;