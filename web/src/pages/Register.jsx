import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/Register.module.css';

const Register = ({ isOpen, onClose, onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        birthMonth: '',
        birthDay: '',
        birthYear: ''
    });

    const [error, setError] = useState('');
    const [daysInMonth, setDaysInMonth] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    // Handle closing with animation - wrapped in useCallback
    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 200); // Match this with animation duration
    }, [onClose]);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                confirmPassword: '',
                birthMonth: '',
                birthDay: '',
                birthYear: ''
            });
            setError('');
            setShowPassword(false);
            setShowConfirmPassword(false);
            setIsClosing(false);
        }
    }, [isOpen]);

    // Handle escape key press
    useEffect(() => {
        const handleEscKey = (e) => {
            if (e.key === 'Escape' && isOpen && !isClosing) {
                handleClose();
            }
        };

        document.addEventListener('keydown', handleEscKey);
        return () => document.removeEventListener('keydown', handleEscKey);
    }, [isOpen, isClosing, handleClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Months array
    const months = [
        { value: '', label: 'Month' },
        { value: '01', label: 'Jan' },
        { value: '02', label: 'Feb' },
        { value: '03', label: 'Mar' },
        { value: '04', label: 'Apr' },
        { value: '05', label: 'May' },
        { value: '06', label: 'Jun' },
        { value: '07', label: 'Jul' },
        { value: '08', label: 'Aug' },
        { value: '09', label: 'Sep' },
        { value: '10', label: 'Oct' },
        { value: '11', label: 'Nov' },
        { value: '12', label: 'Dec' }
    ];

    const currentYear = new Date().getFullYear();
    const years = [{ value: '', label: 'Year' }];
    for (let year = currentYear - 60; year <= currentYear - 15; year++) {
        years.push({ value: year.toString(), label: year.toString() });
    }
    years.reverse(); // Show most recent years first

    // Generate days based on selected month and year
    useEffect(() => {
        if (formData.birthMonth && formData.birthYear) {
            const year = parseInt(formData.birthYear);
            const month = parseInt(formData.birthMonth);
            const daysInMonthCount = new Date(year, month, 0).getDate();
            
            const days = [{ value: '', label: 'Day' }];
            for (let day = 1; day <= daysInMonthCount; day++) {
                days.push({ 
                    value: day.toString().padStart(2, '0'), 
                    label: day.toString() 
                });
            }
            setDaysInMonth(days);
            
            // Reset day if it's invalid for the new month/year
            if (formData.birthDay && parseInt(formData.birthDay) > daysInMonthCount) {
                setFormData(prev => ({ ...prev, birthDay: '' }));
            }
        } else {
            // Default 31 days if no month/year selected
            const days = [{ value: '', label: 'Day' }];
            for (let day = 1; day <= 31; day++) {
                days.push({ 
                    value: day.toString().padStart(2, '0'), 
                    label: day.toString() 
                });
            }
            setDaysInMonth(days);
        }
    }, [formData.birthDay, formData.birthMonth, formData.birthYear]);

    if (!isOpen && !isClosing) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate all birthdate fields are filled
        if (!formData.birthMonth || !formData.birthDay || !formData.birthYear) {
            setError('Please select your complete birthdate');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match!');
            return;
        }

        // Validate age (minimum 13 years old)
        const birthDate = new Date(
            parseInt(formData.birthYear),
            parseInt(formData.birthMonth) - 1,
            parseInt(formData.birthDay)
        );
        const ageDiff = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDiff);
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);

        if (age < 15) {
            setError('You must be at least 15 years old to register');
            return;
        }

        // Combine birthdate fields into single string for backend
        const birthdate = `${formData.birthYear}-${formData.birthMonth}-${formData.birthDay}`;
        
        const result = await register({
            firstName: formData.firstName,
            lastName: formData.lastName,
            birthdate: birthdate,
            email: formData.email,
            password: formData.password
        });

        if (result.success) {
            handleClose();
            navigate('/login');
        } else {
            setError(result.error);
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget && !isClosing) {
            handleClose();
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleLoginClick = (e) => {
        e.preventDefault();
        handleClose();
        // Small delay to allow fade out before opening login modal
        setTimeout(() => {
            onSwitchToLogin();
        }, 200);
    };

    return (
        <div 
            className={`${styles.modalOverlay} ${isClosing ? styles.fadeOut : ''}`} 
            onClick={handleOverlayClick}
        >
            <div className={`${styles.modalContainer} ${isClosing ? styles.slideDown : ''}`}>
                <button className={styles.closeButton} onClick={handleClose} aria-label="Close modal">
                    ×
                </button>
                
                <div className={styles.welcomeContainer}>
                    <h1 className={styles.welcomeTitle}>Welcome to RecipeNest!</h1>
                    <p className={styles.welcomeSubtitle}>Create your account to get started</p>
                </div>
                
                <div className={styles.registerContainer}>
                    <h2 className={styles.registerTitle}>Create Account</h2>
                  
                    {error && (
                        <div className={styles.errorMessage}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.registerForm}>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className={`${styles.formInput} ${formData.firstName ? styles.inputActive : ''}`}
                                    placeholder="Enter first name"
                                    required
                                />
                            </div>
                            
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className={`${styles.formInput} ${formData.lastName ? styles.inputActive : ''}`}
                                    placeholder="Enter last name"
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Birthdate</label>
                                <div className={styles.birthdateSelectors}>
                                    <select
                                        name="birthMonth"
                                        value={formData.birthMonth}
                                        onChange={handleChange}
                                        className={`${styles.formSelect} ${formData.birthMonth ? styles.selectActive : ''}`}
                                        required
                                    >
                                        {months.map(month => (
                                            <option key={month.value} value={month.value}>
                                                {month.label}
                                            </option>
                                        ))}
                                    </select>
                                    
                                    <select
                                        name="birthDay"
                                        value={formData.birthDay}
                                        onChange={handleChange}
                                        className={`${styles.formSelect} ${formData.birthDay ? styles.selectActive : ''}`}
                                        required
                                        disabled={!formData.birthMonth || !formData.birthYear}
                                    >
                                        {daysInMonth.map(day => (
                                            <option key={day.value} value={day.value}>
                                                {day.label}
                                            </option>
                                        ))}
                                    </select>
                                    
                                    <select
                                        name="birthYear"
                                        value={formData.birthYear}
                                        onChange={handleChange}
                                        className={`${styles.formSelect} ${formData.birthYear ? styles.selectActive : ''}`}
                                        required
                                    >
                                        {years.map(year => (
                                            <option key={year.value} value={year.value}>
                                                {year.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`${styles.formInput} ${formData.email ? styles.inputActive : ''}`}
                                    placeholder="Enter email"
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Password</label>
                                <div className={styles.passwordInputContainer}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`${styles.formInput} ${styles.passwordInput} ${formData.password ? styles.inputActive : ''}`}
                                        placeholder="Enter password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className={styles.passwordToggle}
                                        onClick={togglePasswordVisibility}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? "👁️" : "👁️"}
                                    </button>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Confirm Password</label>
                                <div className={styles.passwordInputContainer}>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={`${styles.formInput} ${styles.passwordInput} ${formData.confirmPassword ? styles.inputActive : ''}`}
                                        placeholder="Confirm password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className={styles.passwordToggle}
                                        onClick={toggleConfirmPasswordVisibility}
                                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                    >
                                        {showConfirmPassword ? "👁️" : "👁️"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={styles.submitButton}
                        >
                            Create Account
                        </button>
                    </form>

                    <p className={styles.loginLinkContainer}>
                        Already have an account?{' '}
                        <button 
                            onClick={handleLoginClick}
                            className={styles.loginLink}
                        >
                            Login here
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;