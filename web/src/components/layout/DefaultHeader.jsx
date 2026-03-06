import { Link } from 'react-router-dom';
import { useState } from 'react';
import Login from '../../pages/Login';
import Register from '../../pages/Register';
import styles from '../../styles/DefaultHeader.module.css';

const DefaultHeader = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

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

  return (
    <>
    <header className={styles.header}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.brand}>
          <div className={styles.logoIcon}>🍳</div>
          <span className={styles.logoText}>CookBook</span>
        </Link>
        
        <div className={styles.menu}>
          <Link to="/features" className={styles.navLink}>
            Features
          </Link>
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