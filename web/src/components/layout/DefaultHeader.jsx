import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import Login from '../../pages/Login';
import Register from '../../pages/Register';
import {
  UtensilsCrossed,
  User,
  ShieldCheck,
  Settings,
  LogOut,
} from 'lucide-react';
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

  // ─── Centralized body scroll lock ─────────────────────────────────────────
  // Managed here (not inside each modal) to avoid race conditions when
  // switching between Login and Register — if each modal manages its own
  // lock, the closing modal's cleanup fires after the opening modal sets the
  // lock, silently resetting overflow back to 'unset'.
  useEffect(() => {
    document.body.style.overflow = (showLoginModal || showRegisterModal) ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [showLoginModal, showRegisterModal]);

  // ─── Close dropdown on outside click ──────────────────────────────────────
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

  // ─── Avatar helpers ───────────────────────────────────────────────────────
  const getUserAcronym = () => {
    if (!user) return '?';
    const first = user.firstName?.[0] ?? '';
    const last = user.lastName?.[0] ?? '';
    const initials = (first + last).toUpperCase();
    if (!initials && user.email) return user.email.slice(0, 2).toUpperCase();
    return initials || '?';
  };

  const getDisplayName = () => {
    if (!user) return '';
    if (user.firstName || user.lastName) {
      return [user.firstName, user.lastName].filter(Boolean).join(' ');
    }
    return user.email ?? '';
  };

  const hasProfileImage = Boolean(user?.profileImage);

  return (
    <>
      <header className={styles.header}>
        <nav className={styles.nav}>

          {/* Brand */}
          <Link to={user ? '/dashboard' : '/'} className={styles.brand}>
            <div className={styles.logoIcon}>
              <UtensilsCrossed size={22} color="white" strokeWidth={2} />
            </div>
            <span className={styles.logoText}>CookBook</span>
          </Link>

          {/* Feature nav — hidden on landing */}
          {!isLandingPage && (
            <ul className={styles.navLinks}>
              <li><Link to="/dashboard" className={styles.navLink}>Dashboard</Link></li>
              <li><Link to="/recipes" className={styles.navLink}>Recipes</Link></li>
              <li><Link to="/collections" className={styles.navLink}>Collections</Link></li>
            </ul>
          )}

          {/* Right-side menu */}
          <div className={styles.menu}>
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
                      <User size={15} strokeWidth={2} />
                      My Profile
                    </Link>

                    {user?.role === 'ADMIN' && (
                      <>
                        <Link
                          to="/admin"
                          className={styles.dropdownItem}
                          onClick={() => setShowProfileDropdown(false)}
                          style={{ color: '#A05E33', fontWeight: 700 }}
                        >
                          <ShieldCheck size={15} strokeWidth={2} />
                          Admin Panel
                        </Link>
                        <hr className={styles.dropdownDivider} />
                      </>
                    )}

                    <Link
                      to="/settings"
                      className={styles.dropdownItem}
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <Settings size={15} strokeWidth={2} />
                      Settings
                    </Link>

                    <hr className={styles.dropdownDivider} />

                    <button
                      className={styles.dropdownItemLogout}
                      onClick={handleLogout}
                    >
                      <LogOut size={15} strokeWidth={2} />
                      Log Out
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