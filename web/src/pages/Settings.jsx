import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DefaultHeader from '../components/layout/DefaultHeader';
import authAPI from '../services/auth';
import userAPI from '../services/user';
import {
    User,
    Shield,
    FileText,
    Mail,
    Trash2,
    CheckCircle,
    AlertTriangle,
    X,
    RefreshCw,
    ExternalLink,
    Globe,
    KeyRound,
    Eye,
    EyeOff
} from 'lucide-react';
import styles from '../styles/Settings.module.css';

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'legal', label: 'Legal', icon: FileText },
];

// ─── Main page ────────────────────────────────────────────────────────────────

const Settings = () => {
    const { user, logout, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('account');
    const [message, setMessage] = useState({ text: '', type: '' });

    // Email verification state
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [verifyStep, setVerifyStep] = useState('idle'); // idle | sent | verified
    const [verifyCode, setVerifyCode] = useState('');
    const [sendingCode, setSendingCode] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [emailVerified, setEmailVerified] = useState(user?.emailVerified ?? false);

    // Delete account state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');
    const [deleting, setDeleting] = useState(false);

    const showMsg = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3500);
    };

    // ─── Email verification handlers ─────────────────────────────────────────

    const handleOpenVerify = () => {
        setVerifyStep('idle');
        setVerifyCode('');
        setShowVerifyModal(true);
    };

    const handleSendCode = async () => {
        setSendingCode(true);
        try {
            await authAPI.sendVerificationCode({ email: user.email });
            setVerifyStep('sent');
        } catch {
            showMsg('Failed to send code. Try again.', 'error');
        } finally {
            setSendingCode(false);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        if (verifyCode.length !== 6) return;
        setVerifying(true);
        try {
            await authAPI.verifyCode({ email: user.email, code: verifyCode });
            setVerifyStep('verified');
            setEmailVerified(true);
            await refreshUser();
            setTimeout(() => {
                setShowVerifyModal(false);
                setVerifyStep('idle');
                setVerifyCode('');
                showMsg('Email verified successfully!');
            }, 1200);
        } catch {
            showMsg('Incorrect code. Try again.', 'error');
        } finally {
            setVerifying(false);
        }
    };

    // ─── Delete account handler ───────────────────────────────────────────────

    const handleDeleteAccount = async () => {
        if (deleteConfirmEmail !== user?.email) return;
        setDeleting(true);
        try {
            await userAPI.deleteUser(user.userId);
            await logout();
            navigate('/');
        } catch {
            showMsg('Failed to delete account. Try again.', 'error');
            setDeleting(false);
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <>
            <DefaultHeader user={user} />

            <div className={styles.page}>
                {/* Sidebar */}
                <aside className={styles.sidebar}>
                    <p className={styles.sidebarHeading}>Settings</p>
                    <nav className={styles.sidebarNav}>
                        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                className={`${styles.navItem} ${activeSection === id ? styles.navItemActive : ''}`}
                                onClick={() => setActiveSection(id)}
                            >
                                <Icon size={15} strokeWidth={2} />
                                {label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main content */}
                <main className={styles.content}>
                    {/* Message banner */}
                    {message.text && (
                        <div className={`${styles.messageBanner} ${styles[message.type]}`}>
                            {message.type === 'success'
                                ? <CheckCircle size={15} strokeWidth={2} />
                                : <AlertTriangle size={15} strokeWidth={2} />}
                            {message.text}
                        </div>
                    )}

                    {activeSection === 'account' && (
                        <AccountPanel
                            user={user}
                            emailVerified={emailVerified}
                            onOpenVerify={handleOpenVerify}
                            onOpenDelete={() => setShowDeleteModal(true)}
                        />
                    )}

                    {activeSection === 'security' && (
                        <SecurityPanel user={user} />
                    )}

                    {activeSection === 'legal' && (
                        <LegalPanel />
                    )}
                </main>
            </div>

            {/* Email verification modal */}
            {showVerifyModal && (
                <VerifyEmailModal
                    email={user?.email}
                    step={verifyStep}
                    verifyCode={verifyCode}
                    setVerifyCode={setVerifyCode}
                    sendingCode={sendingCode}
                    verifying={verifying}
                    onSendCode={handleSendCode}
                    onVerifyCode={handleVerifyCode}
                    onClose={() => {
                        setShowVerifyModal(false);
                        setVerifyStep('idle');
                        setVerifyCode('');
                    }}
                />
            )}

            {/* Delete account modal */}
            {showDeleteModal && (
                <DeleteAccountModal
                    email={user?.email}
                    confirmEmail={deleteConfirmEmail}
                    setConfirmEmail={setDeleteConfirmEmail}
                    deleting={deleting}
                    onDelete={handleDeleteAccount}
                    onClose={() => {
                        setShowDeleteModal(false);
                        setDeleteConfirmEmail('');
                    }}
                />
            )}
        </>
    );
};

// ─── Account Panel ────────────────────────────────────────────────────────────

const AccountPanel = ({ user, emailVerified, onOpenVerify, onOpenDelete }) => {
    const isGoogleUser = !user?.password; // Google users have no password in the system

    return (
        <div className={styles.panel}>
            <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>Account</h2>
                <p className={styles.panelSubtitle}>Manage your email and account settings.</p>
            </div>

            {/* Email section */}
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                    <Mail size={15} strokeWidth={2} style={{ marginRight: 7, verticalAlign: 'text-bottom' }} />
                    Email Address
                </h3>

                <div className={styles.emailRow}>
                    <div className={styles.emailInfo}>
                        <span className={styles.emailValue}>{user?.email}</span>
                        {emailVerified ? (
                            <span className={styles.badgeVerified}>
                                <CheckCircle size={12} strokeWidth={2.5} style={{ marginRight: 4 }} />
                                Verified
                            </span>
                        ) : (
                            <span className={styles.badgeUnverified}>
                                <AlertTriangle size={11} strokeWidth={2.5} style={{ marginRight: 4 }} />
                                Unverified
                            </span>
                        )}
                    </div>
                    {!emailVerified && (
                        <button className={styles.btnVerify} onClick={onOpenVerify}>
                            Verify Email
                        </button>
                    )}
                </div>

                {!emailVerified && (
                    <p className={styles.sectionHint}>
                        Verify your email to secure your account and enable account recovery.
                    </p>
                )}
            </div>

            {/* Connected accounts section */}
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                    <Globe size={15} strokeWidth={2} style={{ marginRight: 7, verticalAlign: 'text-bottom' }} />
                    Connected Accounts
                </h3>

                <div className={styles.connectedRow}>
                    <div className={styles.connectedInfo}>
                        <img
                            src="https://developers.google.com/identity/images/g-logo.png"
                            alt="Google"
                            width={18}
                            height={18}
                        />
                        <div>
                            <div className={styles.connectedName}>Google</div>
                            <div className={styles.connectedEmail}>{user?.email}</div>
                        </div>
                    </div>
                    <span className={isGoogleUser ? styles.badgeConnected : styles.badgeNotConnected}>
                        {isGoogleUser ? 'Connected' : 'Not connected'}
                    </span>
                </div>
            </div>

            {/* Danger zone */}
            <div className={`${styles.section} ${styles.dangerSection}`}>
                <h3 className={styles.dangerTitle}>
                    <Trash2 size={15} strokeWidth={2} style={{ marginRight: 7, verticalAlign: 'text-bottom' }} />
                    Delete Account
                </h3>
                <p className={styles.dangerText}>
                    Permanently delete your account, all recipes, and collections. This cannot be undone.
                </p>
                <button className={styles.btnDanger} onClick={onOpenDelete}>
                    Delete My Account
                </button>
            </div>
        </div>
    );
};

// ─── Security Panel (Step 5 placeholder) ─────────────────────────────────────

const SecurityPanel = ({ user }) => {
    const [showModal, setShowModal] = useState(false);
    return (
        <div className={styles.panel}>
            <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>Security</h2>
                <p className={styles.panelSubtitle}>Manage your password and login security.</p>
            </div>

            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                    <KeyRound size={15} strokeWidth={2} style={{ marginRight: 7, verticalAlign: 'text-bottom' }} />
                    Password
                </h3>
                <div className={styles.securityRow}>
                    <div>
                        <div className={styles.securityLabel}>Account Password</div>
                        <div className={styles.securityHint}>
                            {user?.password === undefined
                                ? 'Google Sign-In account — no password set.'
                                : 'Last changed: unknown'}
                        </div>
                    </div>
                    <button className={styles.btnVerify} onClick={() => setShowModal(true)}>
                        Change Password
                    </button>
                </div>
            </div>

            {showModal && (
                <ChangePasswordModal
                    email={user?.email}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
};

const ChangePasswordModal = ({ email, onClose }) => {
    const [tab, setTab] = useState('current'); // 'current' | 'code'
    const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [codeStep, setCodeStep] = useState('idle'); // 'idle' | 'sent'
    const [code, setCode] = useState('');
    const [sendingCode, setSendingCode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const passwordsMatch = form.newPassword === form.confirmPassword;
    const passwordValid = form.newPassword.length >= 8;

    const handleSendCode = async () => {
        setSendingCode(true);
        setError('');
        try {
            await authAPI.sendVerificationCode({ email });
            setCodeStep('sent');
        } catch {
            setError('Failed to send code. Try again.');
        } finally {
            setSendingCode(false);
        }
    };

    const handleSubmitCurrent = async (e) => {
        e.preventDefault();
        if (!passwordsMatch || !passwordValid) return;
        setSaving(true);
        setError('');
        try {
            await authAPI.changePassword({
                oldPassword: form.oldPassword,
                newPassword: form.newPassword,
            });
            setSuccess(true);
            setTimeout(onClose, 1400);
        } catch (err) {
            setError(err.response?.data?.message || 'Incorrect current password.');
        } finally {
            setSaving(false);
        }
    };

    const handleSubmitCode = async (e) => {
        e.preventDefault();
        if (!passwordsMatch || !passwordValid || code.length !== 6) return;
        setSaving(true);
        setError('');
        try {
            await authAPI.changePassword({
                email,
                verificationCode: code,
                newPassword: form.newPassword,
            });
            setSuccess(true);
            setTimeout(onClose, 1400);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid code.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
                <button className={styles.modalClose} onClick={onClose}>
                    <X size={16} strokeWidth={2.5} />
                </button>

                <div className={styles.modalHeader}>
                    <div className={styles.modalIconWrap}>
                        <KeyRound size={28} strokeWidth={1.6} style={{ color: 'var(--terracotta, #C97D4E)' }} />
                    </div>
                    <h3 className={styles.modalTitle}>Change Password</h3>
                    <p className={styles.modalSubtitle}>Choose how you want to verify your identity.</p>
                </div>

                <div className={styles.modalBody}>
                    {success ? (
                        <div className={styles.verifiedState}>
                            <CheckCircle size={40} strokeWidth={1.5} style={{ color: '#4A8B4E' }} />
                            <p>Password changed successfully.</p>
                        </div>
                    ) : (
                        <>
                            {/* Tab switcher */}
                            <div className={styles.tabRow}>
                                <button
                                    className={`${styles.tab} ${tab === 'current' ? styles.tabActive : ''}`}
                                    onClick={() => { setTab('current'); setError(''); }}
                                >
                                    Current Password
                                </button>
                                <button
                                    className={`${styles.tab} ${tab === 'code' ? styles.tabActive : ''}`}
                                    onClick={() => { setTab('code'); setError(''); }}
                                >
                                    Email Code
                                </button>
                            </div>

                            {error && (
                                <div className={styles.inlineError}>
                                    <AlertTriangle size={13} strokeWidth={2} />
                                    {error}
                                </div>
                            )}

                            {/* Tab: Current Password */}
                            {tab === 'current' && (
                                <form onSubmit={handleSubmitCurrent} className={styles.codeForm}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Current Password</label>
                                        <div className={styles.pwWrap}>
                                            <input
                                                className={styles.formInput}
                                                type={showOld ? 'text' : 'password'}
                                                placeholder="Enter current password"
                                                value={form.oldPassword}
                                                onChange={e => setForm({ ...form, oldPassword: e.target.value })}
                                                required
                                            />
                                            <button type="button" className={styles.eyeBtn} onClick={() => setShowOld(v => !v)}>
                                                {showOld ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>New Password</label>
                                        <div className={styles.pwWrap}>
                                            <input
                                                className={styles.formInput}
                                                type={showNew ? 'text' : 'password'}
                                                placeholder="Min. 8 characters"
                                                value={form.newPassword}
                                                onChange={e => setForm({ ...form, newPassword: e.target.value })}
                                                required minLength={8}
                                            />
                                            <button type="button" className={styles.eyeBtn} onClick={() => setShowNew(v => !v)}>
                                                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Confirm New Password</label>
                                        <div className={styles.pwWrap}>
                                            <input
                                                className={styles.formInput}
                                                type={showConfirm ? 'text' : 'password'}
                                                placeholder="Repeat new password"
                                                value={form.confirmPassword}
                                                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                                                required
                                            />
                                            <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirm(v => !v)}>
                                                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </button>
                                        </div>
                                        {form.confirmPassword && !passwordsMatch && (
                                            <p className={styles.mismatch}>Passwords do not match</p>
                                        )}
                                        {form.confirmPassword && passwordsMatch && form.newPassword && (
                                            <p className={styles.matchText}>Passwords match ✓</p>
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        className={styles.btnPrimary}
                                        disabled={saving || !passwordsMatch || !passwordValid || !form.oldPassword}
                                        style={{ width: '100%' }}
                                    >
                                        {saving ? 'Saving…' : 'Update Password'}
                                    </button>
                                </form>
                            )}

                            {/* Tab: Email Code */}
                            {tab === 'code' && (
                                <form onSubmit={handleSubmitCode} className={styles.codeForm}>
                                    {codeStep === 'idle' ? (
                                        <>
                                            <p className={styles.codeHint} style={{ textAlign: 'left', color: 'var(--text-mid, #7A5C46)' }}>
                                                A 6-digit code will be sent to <strong>{email}</strong>.
                                            </p>
                                            <button
                                                type="button"
                                                className={styles.btnPrimary}
                                                onClick={handleSendCode}
                                                disabled={sendingCode}
                                                style={{ width: '100%' }}
                                            >
                                                {sendingCode ? 'Sending…' : 'Send Code to Email'}
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div className={styles.formGroup}>
                                                <label className={styles.formLabel}>Verification Code</label>
                                                <input
                                                    className={styles.codeInput}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={6}
                                                    placeholder="000000"
                                                    value={code}
                                                    onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                    autoFocus
                                                />
                                                <p className={styles.codeHint}>
                                                    Didn't receive it?{' '}
                                                    <button type="button" className={styles.resendBtn} onClick={handleSendCode} disabled={sendingCode}>
                                                        {sendingCode ? 'Sending…' : 'Resend'}
                                                    </button>
                                                </p>
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label className={styles.formLabel}>New Password</label>
                                                <div className={styles.pwWrap}>
                                                    <input
                                                        className={styles.formInput}
                                                        type={showNew ? 'text' : 'password'}
                                                        placeholder="Min. 8 characters"
                                                        value={form.newPassword}
                                                        onChange={e => setForm({ ...form, newPassword: e.target.value })}
                                                        required minLength={8}
                                                    />
                                                    <button type="button" className={styles.eyeBtn} onClick={() => setShowNew(v => !v)}>
                                                        {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label className={styles.formLabel}>Confirm New Password</label>
                                                <div className={styles.pwWrap}>
                                                    <input
                                                        className={styles.formInput}
                                                        type={showConfirm ? 'text' : 'password'}
                                                        placeholder="Repeat new password"
                                                        value={form.confirmPassword}
                                                        onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                                                        required
                                                    />
                                                    <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirm(v => !v)}>
                                                        {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                                                    </button>
                                                </div>
                                                {form.confirmPassword && !passwordsMatch && (
                                                    <p className={styles.mismatch}>Passwords do not match</p>
                                                )}
                                                {form.confirmPassword && passwordsMatch && form.newPassword && (
                                                    <p className={styles.matchText}>Passwords match ✓</p>
                                                )}
                                            </div>
                                            <button
                                                type="submit"
                                                className={styles.btnPrimary}
                                                disabled={saving || code.length !== 6 || !passwordsMatch || !passwordValid}
                                                style={{ width: '100%' }}
                                            >
                                                {saving ? 'Saving…' : 'Update Password'}
                                            </button>
                                        </>
                                    )}
                                </form>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── Legal Panel ──────────────────────────────────────────────────────────────

const LEGAL_LINKS = [
    { label: 'Privacy Policy', path: '/privacy', desc: 'How we handle your data.' },
    { label: 'Terms of Service', path: '/terms', desc: 'Rules for using CookBook.' },
    { label: 'About CookBook', path: '/about', desc: 'Our story and mission.' },
    { label: 'Contact Us', href: 'mailto:support@cookbook.app', desc: 'Get help or send feedback.' },
];

const LegalPanel = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.panel}>
            <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>Legal</h2>
                <p className={styles.panelSubtitle}>Policies, terms, and contact information.</p>
            </div>

            <div className={styles.section}>
                <div className={styles.legalList}>
                    {LEGAL_LINKS.map(({ label, path, href, desc }) => (
                        <button
                            key={label}
                            className={styles.legalItem}
                            onClick={() => path ? navigate(path) : window.open(href, '_blank')}
                        >
                            <div>
                                <div className={styles.legalLabel}>{label}</div>
                                <div className={styles.legalDesc}>{desc}</div>
                            </div>
                            <ExternalLink size={14} strokeWidth={2} style={{ color: 'var(--text-light, #B09080)', flexShrink: 0 }} />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ─── Verify Email Modal ───────────────────────────────────────────────────────

const VerifyEmailModal = ({
    email, step, verifyCode, setVerifyCode,
    sendingCode, verifying, onSendCode, onVerifyCode, onClose,
}) => (
    <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={onClose}>
                <X size={16} strokeWidth={2.5} />
            </button>

            <div className={styles.modalHeader}>
                <div className={styles.modalIconWrap}>
                    <Mail size={28} strokeWidth={1.6} style={{ color: 'var(--terracotta, #C97D4E)' }} />
                </div>
                <h3 className={styles.modalTitle}>Verify Your Email</h3>
                <p className={styles.modalSubtitle}>
                    {step === 'idle'
                        ? `Send a 6-digit code to ${email}`
                        : step === 'sent'
                            ? `Enter the code sent to ${email}`
                            : 'Email verified!'}
                </p>
            </div>

            <div className={styles.modalBody}>
                {step === 'verified' ? (
                    <div className={styles.verifiedState}>
                        <CheckCircle size={40} strokeWidth={1.5} style={{ color: '#4A8B4E' }} />
                        <p>Your email has been verified.</p>
                    </div>
                ) : step === 'idle' ? (
                    <button
                        className={styles.btnPrimary}
                        onClick={onSendCode}
                        disabled={sendingCode}
                        style={{ width: '100%' }}
                    >
                        {sendingCode ? 'Sending…' : 'Send Verification Code'}
                    </button>
                ) : (
                    <form onSubmit={onVerifyCode} className={styles.codeForm}>
                        <input
                            className={styles.codeInput}
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="000000"
                            value={verifyCode}
                            onChange={e => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            autoFocus
                        />
                        <p className={styles.codeHint}>
                            Didn't receive it?{' '}
                            <button type="button" className={styles.resendBtn} onClick={onSendCode} disabled={sendingCode}>
                                {sendingCode ? 'Sending…' : 'Resend'}
                            </button>
                        </p>
                        <button
                            type="submit"
                            className={styles.btnPrimary}
                            disabled={verifyCode.length !== 6 || verifying}
                            style={{ width: '100%' }}
                        >
                            {verifying ? 'Verifying…' : 'Confirm Code'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    </div>
);

// ─── Delete Account Modal ─────────────────────────────────────────────────────

const DeleteAccountModal = ({ email, confirmEmail, setConfirmEmail, deleting, onDelete, onClose }) => {
    const match = confirmEmail === email;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.modalClose} onClick={onClose}>
                    <X size={16} strokeWidth={2.5} />
                </button>

                <div className={`${styles.modalHeader} ${styles.modalHeaderDanger}`}>
                    <div className={styles.modalIconWrap}>
                        <Trash2 size={28} strokeWidth={1.6} style={{ color: '#E05555' }} />
                    </div>
                    <h3 className={`${styles.modalTitle} ${styles.modalTitleDanger}`}>Delete Account</h3>
                    <p className={styles.modalSubtitle}>
                        This will permanently delete your account, recipes, and collections.
                    </p>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            Type <strong>{email}</strong> to confirm
                        </label>
                        <input
                            className={styles.formInput}
                            type="email"
                            placeholder={email}
                            value={confirmEmail}
                            onChange={e => setConfirmEmail(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className={styles.modalActions}>
                        <button className={styles.btnOutline} onClick={onClose} disabled={deleting}>
                            Cancel
                        </button>
                        <button
                            className={styles.btnDangerModal}
                            onClick={onDelete}
                            disabled={!match || deleting}
                        >
                            {deleting ? 'Deleting…' : 'Delete Account'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;