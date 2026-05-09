import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import DefaultHeader from '../../shared/layout/DefaultHeader';
import { ArrowLeft, UtensilsCrossed, Heart, Globe, Shield } from 'lucide-react';
import styles from './LegalPage.module.css';

const About = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <>
            <DefaultHeader user={user} />
            <div className={styles.page}>
                <div className={styles.container}>
                    <button className={styles.backBtn} onClick={() => navigate(-1)}>
                        <ArrowLeft size={14} strokeWidth={2} style={{ marginRight: 5 }} />
                        Back
                    </button>

                    <div className={styles.hero}>
                        <div className={styles.heroIcon}>
                            <UtensilsCrossed size={32} color="white" strokeWidth={2} />
                        </div>
                        <h1 className={styles.heroTitle}>About CookBook</h1>
                        <p className={styles.heroSubtitle}>
                            A personal recipe organizer built with love for home cooks everywhere.
                        </p>
                    </div>

                    <div className={styles.content}>
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Our Story</h2>
                            <p className={styles.body}>
                                CookBook started as a simple idea — a place to store recipes without losing them to
                                scattered notes, bookmarks, and dog-eared cookbook pages. We built it for home cooks
                                who want to organize their culinary world in one beautiful, accessible place.
                            </p>
                            <p className={styles.body}>
                                From beginner cooks trying their first adobo to seasoned chefs cataloguing decades of
                                family recipes, CookBook is designed to grow with you.
                            </p>
                        </section>

                        <div className={styles.featureGrid}>
                            {[
                                {
                                    icon: <Heart size={20} strokeWidth={1.8} />,
                                    title: 'Made for Home Cooks',
                                    desc: 'Every feature is designed around real cooking workflows — not restaurant kitchens.',
                                },
                                {
                                    icon: <Globe size={20} strokeWidth={1.8} />,
                                    title: 'Share Freely',
                                    desc: 'Share recipes with anyone via a simple link — no account required to view.',
                                },
                                {
                                    icon: <Shield size={20} strokeWidth={1.8} />,
                                    title: 'Your Data, Your Control',
                                    desc: 'Keep recipes private or make them public. You always stay in control.',
                                },
                            ].map(({ icon, title, desc }) => (
                                <div key={title} className={styles.featureCard}>
                                    <div className={styles.featureIcon}>{icon}</div>
                                    <h3 className={styles.featureTitle}>{title}</h3>
                                    <p className={styles.featureDesc}>{desc}</p>
                                </div>
                            ))}
                        </div>

                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Contact Us</h2>
                            <p className={styles.body}>
                                Have feedback, a bug report, or just want to say hello? We'd love to hear from you.
                            </p>
                            <a href="mailto:support@cookbook.app" className={styles.contactLink}>
                                support@cookbook.app
                            </a>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
};

export default About;