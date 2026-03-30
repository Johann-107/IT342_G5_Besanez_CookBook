import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Login from '../../pages/Login';
import Register from '../../pages/Register';
import styles from '../../styles/DefaultHeader.module.css';

const DefaultHeader = ({ user = null }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const isDashboard = location.pathname.startsWith('/dashboard');

  const openLoginModal = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  const openRegisterModal = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const closeModals = () => {
    setShowLoginModal(false);
    setShowRegisterModal(false);
  };

  const switchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const switchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown((prev) => !prev);
  };

  const getUserAcronym = (user) => {
    if (!user?.name) return '?';
    return user.name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <header className={styles.header}>
        <nav className={styles.nav}>

          {/* Brand / Logo */}
          <Link to="/" className={styles.brand}>
            <div className={styles.logoIcon}>🍳</div>
            <span className={styles.logoText}>CookBook</span>
          </Link>

          {/* Feature Nav Links — hidden on landing page */}
          {!isLandingPage && (
            <ul className={styles.navLinks}>
              <li><Link to="/dashboard" className={styles.navLink}>Dashboard</Link></li>
              <li><Link to="/recipes" className={styles.navLink}>Recipes</Link></li>
              <li><Link to="/collections" className={styles.navLink}>Collections</Link></li>
            </ul>
          )}

          {/* Right-side menu */}
          <div className={styles.menu}>

            {/* Login / Sign Up — hidden on dashboard or when user is logged in */}
            {!isDashboard && !user && (
              <>
                <button
                  onClick={openLoginModal}
                  className={styles.navLinkButton}
                >
                  Login
                </button>
                <button
                  onClick={openRegisterModal}
                  className={styles.signupButton}
                >
                  Sign Up
                </button>
              </>
            )}

            {/* Avatar — shown when user is logged in */}
            {user && (
              <div className={styles.avatarWrapper}>
                <button
                  className={styles.avatarButton}
                  onClick={toggleProfileDropdown}
                  aria-label="User profile"
                >
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name || 'User avatar'}
                      className={styles.avatarImage}
                    />
                  ) : (
                    <span className={styles.avatarAcronym}>
                      {getUserAcronym(user)}
                    </span>
                  )}
                </button>

                {showProfileDropdown && (
                  <div className={styles.profileDropdown}>
                    <div className={styles.profileDropdownHeader}>
                      <div className={styles.profileDropdownName}>{user.name || 'User'}</div>
                      <div className={styles.profileDropdownEmail}>{user.email || ''}</div>
                    </div>
                    <hr className={styles.dropdownDivider} />
                    <Link
                      to="/profile"
                      className={styles.dropdownItem}
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      👤 My Profile
                    </Link>
                    <Link
                      to="/settings"
                      className={styles.dropdownItem}
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      ⚙️ Settings
                    </Link>
                    <hr className={styles.dropdownDivider} />
                    <button className={styles.dropdownItemLogout}>
                      🚪 Log Out
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </nav>
      </header>

      <Login
        isOpen={showLoginModal}
        onClose={closeModals}
        onSwitchToRegister={switchToRegister}
      />

      <Register
        isOpen={showRegisterModal}
        onClose={closeModals}
        onSwitchToLogin={switchToLogin}
      />
    </>
  );
};

export default DefaultHeader;