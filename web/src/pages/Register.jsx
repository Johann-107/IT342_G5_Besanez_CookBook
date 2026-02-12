import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Register.css';

const Register = () => {
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
    const { register } = useAuth();
    const navigate = useNavigate();

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
            navigate('/login');
        } else {
            setError(result.error);
        }
    }

    return (
        <div className="container">
            <div className="welcome-container">
                <h1 className="welcome-title">Welcome to MyApp!</h1>
                <p className="welcome-subtitle">Create your account to get started</p>
            </div>
            <div className="register-container">
                <h2 className="register-title">Create Account</h2>
              
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="form-input"
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="form-input"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Birthdate</label>
                            <div className="birthdate-selectors">
                                <select
                                    name="birthMonth"
                                    value={formData.birthMonth}
                                    onChange={handleChange}
                                    className="form-select"
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
                                    className="form-select"
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
                                    className="form-select"
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

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="form-input"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="form-input"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="form-input"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="submit-button"
                    >
                        Create Account
                    </button>
                </form>

                <p className="login-link-container">
                    Already have an account? {' '}
                    <Link to="/login" className="login-link">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;