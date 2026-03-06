import React from 'react';
import styles from '../styles/Landing.module.css';
import DefaultHeader from '../components/layout/DefaultHeader';

const Landing = ({
  onGetStarted,
  onSeeFeatures,
  onNavClick,
  onLogoClick,
  onFeatureClick,
  onFooterLinkClick,
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
  const handleGetStarted = () => {
    if (onGetStarted) onGetStarted();
  };

  const handleSeeFeatures = () => {
    if (onSeeFeatures) onSeeFeatures();
  };

  const handleNavClick = (item) => {
    if (onNavClick) onNavClick(item);
  };

  const handleLogoClick = () => {
    if (onLogoClick) onLogoClick();
  };

  const handleFeatureClick = (feature) => {
    if (onFeatureClick) onFeatureClick(feature);
  };

  const handleFooterLinkClick = (link) => {
    if (onFooterLinkClick) onFooterLinkClick(link);
  };

  const features = [
    {
      id: 'create',
      icon: '📝',
      title: 'Create Recipes',
      description: 'Add ingredients, steps, and personal notes with our intuitive editor.',
      bgColor: '#FDE8D0'
    },
    {
      id: 'organize',
      icon: '📂',
      title: 'Organize Collections',
      description: 'Group recipes into custom collections with color coding.',
      bgColor: '#D5EBD6'
    },
    {
      id: 'access',
      icon: '☁️',
      title: 'Access Anywhere',
      description: 'Your recipes sync across all your devices seamlessly.',
      bgColor: '#FDF1D0'
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
              <button 
                className={styles.btnPrimary} 
                onClick={handleGetStarted}
              >
                Get Started Free
              </button>
              <button 
                className={styles.btnOutline} 
                onClick={handleSeeFeatures}
              >
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
              onClick={() => handleFeatureClick(feature.id)}
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
              onClick={() => handleFooterLinkClick(link.id)}
              className={styles.footerLink}
            >
              {link.label}
            </span>
          ))}
          <span className={styles.copyright}>© 2025 CookBook</span>
        </div>
      </div>
    </>
  );
};

export default Landing;