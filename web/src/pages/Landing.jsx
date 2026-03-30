import React, { useState, useEffect } from 'react';
import styles from '../styles/Landing.module.css';
import DefaultHeader from '../components/layout/DefaultHeader';
import Login from './Login'; // adjust path if needed

const Landing = ({
  onGetStarted,
  onSeeFeatures,
  onNavClick,
  onLogoClick,
  onFeatureClick,
  onFooterLinkClick,
  openLoginOnLoad = false, // Added
  featuredRecipe = {
    title: 'Moroccan Lamb Tagine',
    time: '45 min',
    level: 'Adv.',
    emoji: '🥘'
  },
  stats = {
    recipesSaved: 42
  }
}) => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Auto-open login modal with error if redirected from failed Google login
  useEffect(() => {
    if (openLoginOnLoad) {
      setLoginError('Google Sign-In failed. Please try again.');
      setIsLoginOpen(true);
    }
  }, [openLoginOnLoad]);

  const handleGetStarted = () => {
    if (onGetStarted) onGetStarted();
    else setIsLoginOpen(true); // fallback: open login modal
  };

  // ... rest of your existing handlers unchanged ...

  const features = [
    {
      id: 'create', icon: '📝', title: 'Create Recipes',
      description: 'Add ingredients, steps, and personal notes with our intuitive editor.', bgColor: '#FDE8D0'
    },
    {
      id: 'organize', icon: '📂', title: 'Organize Collections',
      description: 'Group recipes into custom collections with color coding.', bgColor: '#D5EBD6'
    },
    {
      id: 'access', icon: '☁️', title: 'Access Anywhere',
      description: 'Your recipes sync across all your devices seamlessly.', bgColor: '#FDF1D0'
    }
  ];

  const footerLinks = [
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
    { id: 'privacy', label: 'Privacy' },
    { id: 'terms', label: 'Terms' }
  ];

  return (
    <>
      <DefaultHeader />
      <div className={styles.landingContainer}>

        {/* Hero Section */}
        <div className={styles.hero}>
          <div className={styles.heroText}>
            <div className={styles.heroBadge}>✨ Free to use</div>
            <h1 className={styles.heroTitle}>
              Your <em>Digital</em> Recipe Organizer
            </h1>
            <p className={styles.heroSubtitle}>
              Store, organize, and access all your favorite recipes from anywhere. Never lose a recipe again.
            </p>
            <div className={styles.heroButtons}>
              <button className={styles.btnPrimary} onClick={handleGetStarted}>
                Get Started Free
              </button>
              <button className={styles.btnOutline} onClick={() => onSeeFeatures && onSeeFeatures()}>
                See Features
              </button>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.heroCard}>
              <div className={styles.heroCardImg}>{featuredRecipe.emoji}</div>
              <div className={styles.heroCardBody}>
                <div className={styles.heroCardTitle}>{featuredRecipe.title}</div>
                <div className={styles.heroCardMeta}>
                  <span className={styles.metaPill}>⏱ {featuredRecipe.time}</span>
                  <span className={styles.metaPill}>🧑‍🍳 {featuredRecipe.level}</span>
                </div>
              </div>
            </div>
            <div className={styles.floatingBadge}>
              🍽 {stats.recipesSaved} Recipes saved
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className={styles.features}>
          {features.map((feature) => (
            <div
              key={feature.id}
              className={styles.featureItem}
              onClick={() => onFeatureClick && onFeatureClick(feature.id)}
            >
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={styles.pageFooter}>
          {footerLinks.map((link) => (
            <span
              key={link.id}
              onClick={() => onFooterLinkClick && onFooterLinkClick(link.id)}
              className={styles.footerLink}
            >
              {link.label}
            </span>
          ))}
          <span className={styles.copyright}>© 2025 CookBook</span>
        </div>
      </div>

      {/* Login Modal */}
      <Login
        isOpen={isLoginOpen}
        onClose={() => { setIsLoginOpen(false); setLoginError(''); }}
        onSwitchToRegister={() => setIsLoginOpen(false)}
        externalError={loginError} // pass the error to the modal
      />
    </>
  );
};

export default Landing;