import React, { useState, useEffect } from 'react';
import { PenLine, FolderOpen, Cloud, Share2, Clock, ShieldCheck } from 'lucide-react';
import styles from './Landing.module.css';
import DefaultHeader from '../../shared/layout/DefaultHeader';
import Login from '../auth/LoginModal';

const Landing = ({
  onGetStarted,
  onSeeFeatures,
  onNavClick,
  onLogoClick,
  onFeatureClick,
  onFooterLinkClick,
  openLoginOnLoad = false,
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

  useEffect(() => {
    if (openLoginOnLoad) {
      setLoginError('Google Sign-In failed. Please try again.');
      setIsLoginOpen(true);
    }
  }, [openLoginOnLoad]);

  const handleGetStarted = () => {
    if (onGetStarted) onGetStarted();
    else setIsLoginOpen(true);
  };

  const features = [
    {
      id: 'create',
      Icon: PenLine,
      title: 'Create Recipes',
      description: 'Add ingredients, steps, and personal notes with our intuitive editor.',
      bullets: ['Rich ingredient editor with units', 'Step-by-step instructions', 'Add photos via upload or URL'],
      accent: '#C97D4E',
      bg: '#FDE8D0',
    },
    {
      id: 'organize',
      Icon: FolderOpen,
      title: 'Organise Collections',
      description: 'Group recipes into custom collections — by cuisine, occasion, or mood.',
      bullets: ['Unlimited collections', 'Add any recipe to multiple collections', 'Visual cover slideshows'],
      accent: '#8BAF8D',
      bg: '#D5EBD6',
    },
    {
      id: 'share',
      Icon: Share2,
      title: 'Share Recipes',
      description: 'Generate a shareable link for any recipe — no account required to view.',
      bullets: ['One-click share links', 'Viewers can save a copy', 'Revoke access anytime'],
      accent: '#9B6BAB',
      bg: '#E8D5F5',
    },
    {
      id: 'access',
      Icon: Cloud,
      title: 'Access Anywhere',
      description: 'Your recipes sync across all devices seamlessly.',
      bullets: ['Works on desktop, tablet, mobile', 'Instant sync, no manual save', 'Google sign-in supported'],
      accent: '#6BA3BF',
      bg: '#D0E8F5',
    },
    {
      id: 'time',
      Icon: Clock,
      title: 'Track Cook Times',
      description: 'Log prep, cook, and total times for every recipe.',
      bullets: ['Prep & cook time fields', 'Total time auto-calculated', 'Filter recipes by duration'],
      accent: '#D9A84A',
      bg: '#FDF1D0',
    },
    {
      id: 'privacy',
      Icon: ShieldCheck,
      title: 'Privacy Controls',
      description: 'Keep recipes private or publish them publicly — you decide.',
      bullets: ['Public or private per recipe', 'Private by default', 'Admin-free moderation'],
      accent: '#D47B85',
      bg: '#FFE4D6',
    },
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
              Store, organise, and access all your favourite recipes from anywhere. Never lose a recipe again.
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

        {/* Features Header */}
        <div className={styles.featuresHeader}>
          <p className={styles.featuresEyebrow}>Everything you need</p>
          <h2 className={styles.featuresTitle}>Built for home cooks</h2>
          <p className={styles.featuresSubtitle}>
            From your first saved recipe to a library of hundreds — CookBook grows with you.
          </p>
        </div>

        {/* Features Grid */}
        <div className={styles.featuresGrid}>
          {features.map((feature) => (
            <div
              key={feature.id}
              className={styles.featureCard}
              onClick={() => onFeatureClick && onFeatureClick(feature.id)}
            >
              <div
                className={styles.featureIconWrap}
                style={{ background: feature.bg, color: feature.accent }}
              >
                <feature.Icon size={22} strokeWidth={1.8} />
              </div>
              <h3 className={styles.featureCardTitle}>{feature.title}</h3>
              <p className={styles.featureCardDesc}>{feature.description}</p>
              <ul className={styles.featureBullets}>
                {feature.bullets.map((b) => (
                  <li key={b} className={styles.featureBullet}>
                    <span className={styles.bulletDot} style={{ background: feature.accent }} />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <Login
        isOpen={isLoginOpen}
        onClose={() => { setIsLoginOpen(false); setLoginError(''); }}
        onSwitchToRegister={() => setIsLoginOpen(false)}
        externalError={loginError}
      />
    </>
  );
};

export default Landing;