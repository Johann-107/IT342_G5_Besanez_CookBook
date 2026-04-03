import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DefaultHeader from '../components/layout/DefaultHeader';
import userAPI from '../services/user';
import styles from '../styles/Profile.module.css';

const Profile = () => {
    const { user, logout, changePassword } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        // birthdate not editable here — would need a separate endpoint or
        // passing the existing value through, but UserRequestDTO requires password too
        cookingLevel: 'intermediate',
        dietaryPrefs: ['Gluten-Free', 'Dairy-Free'],
    });

    const [passwordForm, setPasswordForm] = useState({
        current: '',
        newPass: '',
        confirm: '',
    });

    const [message, setMessage] = useState({ text: '', type: '' });
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    // ─── Update Profile ───────────────────────────────────────────────────────
    // NOTE: UserRequestDTO requires a non-blank password field (it's validated),
    // so we send a placeholder — UserService doesn't update the password,
    // only AuthService.changePassword does.
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            await userAPI.updateUser(user.userId, {
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                birthdate: user.birthdate || null,
                password: 'placeholder-not-updated', // required by DTO but ignored by service
            });
            showMessage('Profile updated successfully!');
        } catch (err) {
            showMessage(err.response?.data?.message || 'Failed to update profile.', 'error');
        } finally {
            setSavingProfile(false);
        }
    };

    // ─── Change Password ──────────────────────────────────────────────────────
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordForm.newPass !== passwordForm.confirm) {
            showMessage('New passwords do not match.', 'error');
            return;
        }
        setSavingPassword(true);
        const result = await changePassword(passwordForm.current, passwordForm.newPass);
        if (result.success) {
            setPasswordForm({ current: '', newPass: '', confirm: '' });
            showMessage('Password updated successfully!');
        } else {
            showMessage(result.error || 'Failed to change password.', 'error');
        }
        setSavingPassword(false);
    };

    // ─── Delete Account ───────────────────────────────────────────────────────
    const handleDeleteAccount = async () => {
        if (!window.confirm('Delete your account permanently? This cannot be undone.')) return;
        try {
            await userAPI.deleteUser(user.userId);
            await logout();
            navigate('/');
        } catch {
            showMessage('Failed to delete account.', 'error');
        }
    };

    const removeTag = (tag) => {
        setForm(f => ({ ...f, dietaryPrefs: f.dietaryPrefs.filter(t => t !== tag) }));
    };

    const getInitials = () => {
        const first = (form.firstName || user?.firstName || '')[0] || '';
        const last = (form.lastName || user?.lastName || '')[0] || '';
        return (first + last).toUpperCase() || 'U';
    };

    return (
        <>
            <DefaultHeader user={user} />
            <div className={styles.page}>
                <div className={styles.pageHeader}>
                    <h2 className={styles.pageTitle}>My Profile</h2>
                    <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>
                        ← Dashboard
                    </button>
                </div>

                {message.text && (
                    <div className={`${styles.message} ${styles[message.type]}`}>
                        <span>{message.type === 'success' ? '✓' : '⚠'}</span>
                        {message.text}
                    </div>
                )}

                <div className={styles.profileBody}>
                    {/* Left Sidebar */}
                    <div className={styles.left}>
                        <div className={styles.avatarSection}>
                            <div className={styles.bigAvatar}>{getInitials()}</div>
                            <div className={styles.avatarBtns}>
                                <button className={styles.btnGhost}>📷 Upload Photo</button>
                                <button className={styles.btnGhostOutline}>Remove</button>
                            </div>
                        </div>

                        <div className={styles.accountInfo}>
                            <span className={styles.aiLabel}>Email</span>
                            <span className={styles.aiValue}>{user?.email || '—'}</span>

                            <span className={styles.aiLabel}>Member Since</span>
                            <span className={styles.aiValue}>
                                {user?.createdAt
                                    ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                        month: 'long', year: 'numeric'
                                    })
                                    : 'March 2024'}
                            </span>
                        </div>
                    </div>

                    {/* Right Content */}
                    <div className={styles.right}>

                        {/* Personal Info */}
                        <div className={styles.profileSection}>
                            <h4 className={styles.sectionTitle}>Personal Information</h4>
                            <form onSubmit={handleProfileSubmit}>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>First Name</label>
                                        <input
                                            className={`${styles.formInput} ${form.firstName ? styles.inputActive : ''}`}
                                            type="text"
                                            value={form.firstName}
                                            onChange={e => setForm({ ...form, firstName: e.target.value })}
                                            placeholder="First name"
                                            required
                                            maxLength={50}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Last Name</label>
                                        <input
                                            className={`${styles.formInput} ${form.lastName ? styles.inputActive : ''}`}
                                            type="text"
                                            value={form.lastName}
                                            onChange={e => setForm({ ...form, lastName: e.target.value })}
                                            placeholder="Last name"
                                            required
                                            maxLength={50}
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>
                                        Email{' '}
                                        <span className={styles.verifiedBadge}>✓ Verified</span>
                                    </label>
                                    <input
                                        className={styles.formInput}
                                        type="email"
                                        value={form.email}
                                        disabled
                                        style={{ opacity: 0.6 }}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Cooking Skill Level</label>
                                    <select
                                        className={styles.selectInput}
                                        value={form.cookingLevel}
                                        onChange={e => setForm({ ...form, cookingLevel: e.target.value })}
                                    >
                                        <option value="beginner">👶 Beginner</option>
                                        <option value="intermediate">🧑‍🍳 Intermediate</option>
                                        <option value="advanced">⭐ Advanced</option>
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Dietary Preferences</label>
                                    <div className={styles.tagsInput}>
                                        {form.dietaryPrefs.map(tag => (
                                            <span key={tag} className={styles.dietTag}>
                                                {tag}
                                                <span className={styles.remove} onClick={() => removeTag(tag)}>×</span>
                                            </span>
                                        ))}
                                        <span className={styles.addTag}>+ add</span>
                                    </div>
                                </div>

                                <div className={styles.formActions}>
                                    <button type="submit" className={styles.btnPrimary} disabled={savingProfile}>
                                        {savingProfile ? 'Saving…' : 'Save Changes'}
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.btnOutline}
                                        onClick={() => setForm({
                                            firstName: user?.firstName || '',
                                            lastName: user?.lastName || '',
                                            email: user?.email || '',
                                            cookingLevel: 'intermediate',
                                            dietaryPrefs: ['Gluten-Free', 'Dairy-Free'],
                                        })}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Change Password */}
                        <div className={styles.profileSection}>
                            <h4 className={styles.sectionTitle}>Change Password ▸</h4>
                            <form onSubmit={handlePasswordSubmit}>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Current Password</label>
                                    <input
                                        className={styles.formInput}
                                        type="password"
                                        placeholder="••••••••"
                                        value={passwordForm.current}
                                        onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>New Password</label>
                                        <input
                                            className={styles.formInput}
                                            type="password"
                                            placeholder="Min. 8 characters"
                                            value={passwordForm.newPass}
                                            onChange={e => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                                            required
                                            minLength={8}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Confirm</label>
                                        <input
                                            className={styles.formInput}
                                            type="password"
                                            placeholder="Repeat password"
                                            value={passwordForm.confirm}
                                            onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <button type="submit" className={styles.btnGhost} disabled={savingPassword}>
                                    {savingPassword ? 'Updating…' : 'Update Password'}
                                </button>
                            </form>
                        </div>

                        {/* Danger Zone */}
                        <div className={styles.dangerZone}>
                            <h4 className={styles.dangerTitle}>⚠️ Danger Zone</h4>
                            <p className={styles.dangerText}>
                                Permanently delete your account and all your recipes. This cannot be undone.
                            </p>
                            <button className={styles.btnDanger} onClick={handleDeleteAccount}>
                                Delete My Account
                            </button>
                        </div>
                    </div>
                </div>

                <div className={styles.profileFooter}>
                    <button className={styles.btnOutline} onClick={() => navigate('/dashboard')}>Cancel</button>
                    <button className={styles.btnPrimary} onClick={handleProfileSubmit} disabled={savingProfile}>
                        {savingProfile ? 'Saving…' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </>
    );
};

export default Profile;