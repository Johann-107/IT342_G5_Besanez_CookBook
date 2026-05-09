import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DefaultHeader from '../components/layout/DefaultHeader';
import { ArrowLeft } from 'lucide-react';
import styles from '../styles/LegalPage.module.css';

const Privacy = () => {
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

                    <div className={styles.docHeader}>
                        <h1 className={styles.docTitle}>Privacy Policy</h1>
                        <p className={styles.docMeta}>Last updated: May 2026</p>
                    </div>

                    <div className={styles.content}>
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Information We Collect</h2>
                            <p className={styles.body}>
                                When you create an account we collect your name, email address, and birthdate.
                                If you sign in with Google, we receive your public Google profile information
                                including your name and email. Profile photos are uploaded to and stored on
                                Cloudinary, our image hosting provider.
                            </p>
                            <p className={styles.body}>
                                We also store the recipes, ingredients, instructions, collections, and any
                                other content you create within the app.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>How We Use Your Information</h2>
                            <ul className={styles.list}>
                                <li>To provide and operate the CookBook service.</li>
                                <li>To authenticate your identity and keep your account secure.</li>
                                <li>To send verification codes when requested.</li>
                                <li>To display your profile and content within the app.</li>
                            </ul>
                            <p className={styles.body}>
                                We do not sell your personal information to third parties. We do not use your
                                data for advertising purposes.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Data Storage</h2>
                            <p className={styles.body}>
                                Your data is stored in a PostgreSQL database hosted on a secure cloud provider.
                                Images are stored via Cloudinary. Passwords are hashed using BCrypt and are
                                never stored in plain text.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Your Rights</h2>
                            <p className={styles.body}>
                                You may delete your account at any time from Settings → Account → Delete Account.
                                Deleting your account permanently removes all your data including recipes,
                                collections, and profile information.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Cookies</h2>
                            <p className={styles.body}>
                                CookBook uses a JSON Web Token (JWT) stored in your browser's local storage to
                                keep you logged in. We do not use third-party tracking cookies.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Contact</h2>
                            <p className={styles.body}>
                                For privacy-related questions contact us at{' '}
                                <a href="mailto:support@cookbook.app" className={styles.inlineLink}>
                                    support@cookbook.app
                                </a>.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Privacy;