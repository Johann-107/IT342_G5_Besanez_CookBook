import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import DefaultHeader from '../../shared/layout/DefaultHeader';
import { ArrowLeft } from 'lucide-react';
import styles from './LegalPage.module.css';

const Terms = () => {
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
                        <h1 className={styles.docTitle}>Terms of Service</h1>
                        <p className={styles.docMeta}>Last updated: May 2026</p>
                    </div>

                    <div className={styles.content}>
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Acceptance of Terms</h2>
                            <p className={styles.body}>
                                By creating an account or using CookBook, you agree to these Terms of Service.
                                If you do not agree, do not use the service.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Your Account</h2>
                            <ul className={styles.list}>
                                <li>You must be at least 15 years old to create an account.</li>
                                <li>You are responsible for keeping your password secure.</li>
                                <li>You may not share your account with others.</li>
                                <li>You may not create accounts for the purpose of abuse or spam.</li>
                            </ul>
                        </section>

                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Your Content</h2>
                            <p className={styles.body}>
                                You own the recipes and content you create on CookBook. By marking a recipe as
                                public or generating a share link, you grant other users the ability to view
                                and save a copy of that recipe.
                            </p>
                            <p className={styles.body}>
                                You may not upload content that infringes on copyright, contains malware,
                                or violates any applicable law.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Service Availability</h2>
                            <p className={styles.body}>
                                We strive to keep CookBook available at all times but do not guarantee
                                uninterrupted access. We may modify or discontinue features at any time.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Account Termination</h2>
                            <p className={styles.body}>
                                You may delete your account at any time from Settings → Account.
                                We reserve the right to suspend or terminate accounts that violate these terms.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Limitation of Liability</h2>
                            <p className={styles.body}>
                                CookBook is provided "as is" without warranties of any kind. We are not liable
                                for any loss of data or damages arising from use of the service.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Contact</h2>
                            <p className={styles.body}>
                                Questions about these terms? Contact us at{' '}
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

export default Terms;