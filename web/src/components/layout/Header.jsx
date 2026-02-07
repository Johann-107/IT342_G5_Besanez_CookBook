import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <nav className="header-nav">
        <Link to="/" className="header-brand">
          MyApp
        </Link>
        
        <div className="header-menu">
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
              <Link to="/profile" className="nav-link">
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="logout-button"
              >
                Logout
              </button>
              <span className="user-welcome">
                Welcome, {user.name}
              </span>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link 
                to="/register" 
                className="signup-button"
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