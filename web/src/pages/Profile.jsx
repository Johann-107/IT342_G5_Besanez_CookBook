import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import styles from '../styles/Profile.module.css';

const Profile = () => {
    const { user, updateProfile } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phoneNumber || '');
    const [gender, setGender] = useState(user?.gender || '');
    const [birthdate, setBirthdate] = useState(user?.birthdate || '');
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const updatedUser = {
            ...user,
            name,
            email,
            phoneNumber: phone,
            gender,
            birthdate
        };
        updateProfile(updatedUser);

        setMessage({
            text: 'Profile updated successfully!',
            type: 'success'
        });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    // Format birthdate for display
    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Calculate age from birthdate
    const calculateAge = () => {
        if (!user?.birthdate) return 'N/A';
        const birthDate = new Date(user.birthdate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    };

    // Format member since date
    const memberSince = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

    return (
        <div className={styles.profileContainer}>
            <div className={styles.profileHeader}>
                <h1 className={styles.profileTitle}>Profile Settings</h1>
                <p className={styles.profileSubtitle}>Manage your account information</p>
            </div>

            {message.text && (
                <div className={styles.message + ' ' + (message.type === 'success' ? styles.success : styles.error)}>
                    <span className={styles.messageIcon}>
                        {message.type === 'success' ? '✓' : '⚠'}
                    </span>
                    {message.text}
                </div>
            )}

            <div className={styles.profileContent}>
                {/* Left Sidebar - Profile Info */}
                <div className={styles.profileSidebar}>
                    <div className={styles.profileCard}>
                        <div className={styles.profileAvatar}>
                            <div className={styles.avatarInitials}>
                                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                            </div>
                        </div>
                        <div className={styles.profileInfo}>
                            <h2 className={styles.profileName}>{user?.name || 'User'}</h2>
                            <p className={styles.profileEmail}>{user?.email || 'No email'}</p>
                            <div className={styles.profileStats}>
                                <div className={styles.statItem}>
                                    <span className={styles.statLabel}>Age</span>
                                    <span className={styles.statValue}>{calculateAge()}</span>
                                </div>
                                <div className={styles.statItem}>
                                    <span className={styles.statLabel}>Gender</span>
                                    <span className={styles.statValue}>{user?.gender || 'Not set'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.accountInfo}>
                        <h3 className={styles.accountTitle}>Account Details</h3>
                        <ul className={styles.accountList}>
                            <li className={styles.accountItem}>
                                <span className={styles.accountLabel}>Member since:</span>
                                <span className={styles.accountValue}>{memberSince}</span>
                            </li>
                            <li className={styles.accountItem}>
                                <span className={styles.accountLabel}>User ID:</span>
                                <span className={styles.accountValue}>{user?.id?.slice(0, 8) || 'N/A'}</span>
                            </li>
                            <li className={styles.accountItem}>
                                <span className={styles.accountLabel}>Status:</span>
                                <span className={styles.accountStatus + ' ' + styles.accountStatusActive}>Active</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Right Content - Edit Form */}
                <div className={styles.profileFormContainer}>
                    <div className={styles.formCard}>
                        <div className={styles.formHeader}>
                            <h2 className={styles.formTitle}>Edit Profile</h2>
                            <p className={styles.formSubtitle}>Update your personal information</p>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.profileForm}>
                            <div className={styles.formSection}>
                                <h3 className={styles.sectionTitle}>Personal Information</h3>
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>
                                            Full Name
                                            <span className={styles.required}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className={styles.formInput}
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Gender</label>
                                        <select
                                            value={gender}
                                            onChange={(e) => setGender(e.target.value)}
                                            className={styles.formInput}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                            <option value="prefer-not-to-say">Prefer not to say</option>
                                        </select>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Date of Birth</label>
                                        <input
                                            type="date"
                                            value={birthdate}
                                            onChange={(e) => setBirthdate(e.target.value)}
                                            className={styles.formInput}
                                        />
                                        {birthdate && (
                                            <div className={styles.dateHint}>
                                                {formatDate(birthdate)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.formSection}>
                                <h3 className={styles.sectionTitle}>Contact Information</h3>
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>
                                            Email Address
                                            <span className={styles.required}>*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className={styles.formInput}
                                            placeholder="your.email@example.com"
                                            required
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Phone Number</label>
                                        <div className={styles.phoneInputContainer}>
                                            <span className={styles.phonePrefix}>+1</span>
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                className={styles.formInput}
                                                placeholder="(123) 456-7890"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.formActions}>
                                <button
                                    type="submit"
                                    className={styles.submitButton}
                                >
                                    <span className={styles.buttonText}>Save Changes</span>
                                    <span className={styles.buttonIcon}>✓</span>
                                </button>
                                <button
                                    type="button"
                                    className={styles.cancelButton}
                                    onClick={() => {
                                        setName(user?.name || '');
                                        setEmail(user?.email || '');
                                        setPhone(user?.phoneNumber || '');
                                        setGender(user?.gender || '');
                                        setBirthdate(user?.birthdate || '');
                                    }}
                                >
                                    Reset
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className={styles.dangerZone}>
                        <h3 className={styles.dangerTitle}>Account Actions</h3>
                        <div className={styles.dangerContent}>
                            <p className={styles.dangerText}>
                                Permanently delete your account and all associated data.
                            </p>
                            <button className={styles.dangerButton}>
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;