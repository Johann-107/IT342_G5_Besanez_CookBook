import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/Profile.css";

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
        <div className="profile-container">
            <div className="profile-header">
                <h1 className="profile-title">Profile Settings</h1>
                <p className="profile-subtitle">Manage your account information</p>
            </div>

            {message.text && (
                <div className={`message ${message.type}`}>
                    <span className="message-icon">
                        {message.type === 'success' ? '✓' : '⚠'}
                    </span>
                    {message.text}
                </div>
            )}

            <div className="profile-content">
                {/* Left Sidebar - Profile Info */}
                <div className="profile-sidebar">
                    <div className="profile-card">
                        <div className="profile-avatar">
                            <div className="avatar-initials">
                                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                            </div>
                        </div>
                        <div className="profile-info">
                            <h2 className="profile-name">{user?.name || 'User'}</h2>
                            <p className="profile-email">{user?.email || 'No email'}</p>
                            <div className="profile-stats">
                                <div className="stat-item">
                                    <span className="stat-label">Age</span>
                                    <span className="stat-value">{calculateAge()}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Gender</span>
                                    <span className="stat-value">{user?.gender || 'Not set'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="account-info">
                        <h3 className="account-title">Account Details</h3>
                        <ul className="account-list">
                            <li className="account-item">
                                <span className="account-label">Member since:</span>
                                <span className="account-value">{memberSince}</span>
                            </li>
                            <li className="account-item">
                                <span className="account-label">User ID:</span>
                                <span className="account-value">{user?.id?.slice(0, 8) || 'N/A'}</span>
                            </li>
                            <li className="account-item">
                                <span className="account-label">Status:</span>
                                <span className="account-status active">Active</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Right Content - Edit Form */}
                <div className="profile-form-container">
                    <div className="form-card">
                        <div className="form-header">
                            <h2 className="form-title">Edit Profile</h2>
                            <p className="form-subtitle">Update your personal information</p>
                        </div>

                        <form onSubmit={handleSubmit} className="profile-form">
                            <div className="form-section">
                                <h3 className="section-title">Personal Information</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">
                                            Full Name
                                            <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="form-input"
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Gender</label>
                                        <select
                                            value={gender}
                                            onChange={(e) => setGender(e.target.value)}
                                            className="form-input"
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                            <option value="prefer-not-to-say">Prefer not to say</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Date of Birth</label>
                                        <input
                                            type="date"
                                            value={birthdate}
                                            onChange={(e) => setBirthdate(e.target.value)}
                                            className="form-input"
                                        />
                                        {birthdate && (
                                            <div className="date-hint">
                                                {formatDate(birthdate)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3 className="section-title">Contact Information</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">
                                            Email Address
                                            <span className="required">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="form-input"
                                            placeholder="your.email@example.com"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Phone Number</label>
                                        <div className="phone-input-container">
                                            <span className="phone-prefix">+1</span>
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                className="form-input phone-input"
                                                placeholder="(123) 456-7890"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="submit"
                                    className="submit-button"
                                >
                                    <span className="button-text">Save Changes</span>
                                    <span className="button-icon">✓</span>
                                </button>
                                <button
                                    type="button"
                                    className="cancel-button"
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

                    <div className="danger-zone">
                        <h3 className="danger-title">Account Actions</h3>
                        <div className="danger-content">
                            <p className="danger-text">
                                Permanently delete your account and all associated data.
                            </p>
                            <button className="danger-button">
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