import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import Login from '../../pages/Login';
import Register from '../../pages/Register';
import styles from '../../styles/DefaultHeader.module.css';

const DefaultHeader = ({ user = null }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const dropdownRef = useRef(null);

  const isLandingPage = location.pathname === '/';

  // ─── Close dropdown when clicking outside ─────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ─── Modal helpers ─────────────────────────────────────────────────────────
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

  // ─── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    setShowProfileDropdown(false);
    await logout();
    navigate('/');
  };

  // ─── Avatar acronym ───────────────────────────────────────────────────────
  // Backend returns { firstName, lastName } — never a combined `name` field
  const getUserAcronym = () => {
    if (!user) return '?';
    const first = user.firstName?.[0] ?? '';
    const last = user.lastName?.[0] ?? '';
    const initials = (first + last).toUpperCase();
    // Fallback: use first two characters of email
    if (!initials && user.email) return user.email.slice(0, 2).toUpperCase();
    return initials || '?';
  };

  // ─── Display name ─────────────────────────────────────────────────────────
  const getDisplayName = () => {
    if (!user) return '';
    if (user.firstName || user.lastName) {
      return [user.firstName, user.lastName].filter(Boolean).join(' ');
    }
    return user.email ?? '';
  };

  // ─── Profile image ────────────────────────────────────────────────────────
  // Backend UserResponseDTO has no profileImage field — always use acronym avatar.
  // If a profileImage is ever added, this will pick it up automatically.
  const hasProfileImage = Boolean(user?.profileImage);

  return (
    <>
      <header className={styles.header}>
        <nav className={styles.nav}>

          {/* Brand / Logo */}
          <Link to={user ? "/dashboard" : "/"} className={styles.brand}>
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

            {/* Login / Sign Up — shown only when no user is logged in */}
            {!user && (
              <>
                <button onClick={openLoginModal} className={styles.navLinkButton}>
                  Login
                </button>
                <button onClick={openRegisterModal} className={styles.signupButton}>
                  Sign Up
                </button>
              </>
            )}

            {/* Avatar — shown when user is logged in */}
            {user && (
              <div className={styles.avatarWrapper} ref={dropdownRef}>
                <button
                  className={styles.avatarButton}
                  onClick={() => setShowProfileDropdown(prev => !prev)}
                  aria-label="User profile"
                  aria-expanded={showProfileDropdown}
                >
                  {hasProfileImage ? (
                    <img
                      src={user.profileImage}
                      alt={getDisplayName() || 'User avatar'}
                      className={styles.avatarImage}
                    />
                  ) : (
                    <span className={styles.avatarAcronym}>
                      {getUserAcronym()}
                    </span>
                  )}
                </button>

                {showProfileDropdown && (
                  <div className={styles.profileDropdown}>
                    <div className={styles.profileDropdownHeader}>
                      <div className={styles.profileDropdownName}>
                        {getDisplayName() || 'User'}
                      </div>
                      <div className={styles.profileDropdownEmail}>
                        {user.email ?? ''}
                      </div>
                    </div>

                    <hr className={styles.dropdownDivider} />

                    <Link
                      to="/profile"
                      className={styles.dropdownItem}
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      👤 My Profile
                    </Link>

                    {user?.role === 'ADMIN' && (
                      <>
                        <Link
                          to="/admin"
                          className={styles.dropdownItem}
                          onClick={() => setShowProfileDropdown(false)}
                          style={{ color: '#A05E33', fontWeight: 700 }}
                        >
                          ⭐ Admin Panel
                        </Link>
                        <hr className={styles.dropdownDivider} />
                      </>
                    )}

                    {/* Settings — intentionally left as-is (no route wired) */}
                    <Link
                      to="/settings"
                      className={styles.dropdownItem}
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      ⚙️ Settings
                    </Link>

                    <hr className={styles.dropdownDivider} />

                    <button
                      className={styles.dropdownItemLogout}
                      onClick={handleLogout}
                    >
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