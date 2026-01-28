import { useState } from 'react';
import './Login.css';

function Login({ onLogin }) {
    const [isSignup, setIsSignup] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (isSignup && !formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (isSignup) {
            if (!formData.confirmPassword) {
                newErrors.confirmPassword = 'Please confirm your password';
            } else if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle signup
    const handleSignup = () => {
        if (!validateForm()) return;

        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            // Get existing users or initialize
            const users = JSON.parse(localStorage.getItem('chatbot_users') || '[]');

            // Check if user already exists
            if (users.find(u => u.email === formData.email)) {
                setErrors({ email: 'Email already registered' });
                setIsLoading(false);
                return;
            }

            // Create new user
            const newUser = {
                name: formData.name,
                email: formData.email,
                password: formData.password, // In real app, this would be hashed
                createdAt: new Date().toISOString()
            };

            // Save user
            users.push(newUser);
            localStorage.setItem('chatbot_users', JSON.stringify(users));

            // Create session
            const session = {
                isAuthenticated: true,
                user: {
                    name: newUser.name,
                    email: newUser.email
                },
                loginTime: new Date().toISOString(),
                rememberMe
            };

            if (rememberMe) {
                localStorage.setItem('chatbot_session', JSON.stringify(session));
            } else {
                sessionStorage.setItem('chatbot_session', JSON.stringify(session));
            }

            setIsLoading(false);
            onLogin(session.user);
        }, 1000);
    };

    // Handle login
    const handleLogin = () => {
        if (!validateForm()) return;

        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            // Get users
            const users = JSON.parse(localStorage.getItem('chatbot_users') || '[]');

            // Find user
            const user = users.find(
                u => u.email === formData.email && u.password === formData.password
            );

            if (!user) {
                setErrors({ email: 'Invalid email or password' });
                setIsLoading(false);
                return;
            }

            // Create session
            const session = {
                isAuthenticated: true,
                user: {
                    name: user.name,
                    email: user.email
                },
                loginTime: new Date().toISOString(),
                rememberMe
            };

            if (rememberMe) {
                localStorage.setItem('chatbot_session', JSON.stringify(session));
            } else {
                sessionStorage.setItem('chatbot_session', JSON.stringify(session));
            }

            setIsLoading(false);
            onLogin(session.user);
        }, 1000);
    };

    // Handle form submit
    const handleSubmit = (e) => {
        e.preventDefault();
        if (isSignup) {
            handleSignup();
        } else {
            handleLogin();
        }
    };

    // Toggle between login and signup
    const toggleMode = () => {
        setIsSignup(!isSignup);
        setFormData({
            name: '',
            email: '',
            password: '',
            confirmPassword: ''
        });
        setErrors({});
    };

    return (
        <div className="login-container">
            <div className="login-background"></div>

            <div className="login-card">
                <div className="login-header">
                    <div className="login-icon">🤖</div>
                    <h1 className="login-title">GenAI Chatbot</h1>
                    <p className="login-subtitle">
                        {isSignup ? 'Create your account' : 'Welcome back!'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {isSignup && (
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                className={errors.name ? 'error' : ''}
                            />
                            {errors.name && <span className="error-message">{errors.name}</span>}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            className={errors.email ? 'error' : ''}
                        />
                        {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-input">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className={errors.password ? 'error' : ''}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                        {errors.password && <span className="error-message">{errors.password}</span>}
                    </div>

                    {isSignup && (
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className={errors.confirmPassword ? 'error' : ''}
                            />
                            {errors.confirmPassword && (
                                <span className="error-message">{errors.confirmPassword}</span>
                            )}
                        </div>
                    )}

                    {!isSignup && (
                        <div className="form-options">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <span>Remember me</span>
                            </label>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="spinner"></div>
                        ) : (
                            <span>{isSignup ? 'Sign Up' : 'Log In'}</span>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p>
                        {isSignup ? 'Already have an account?' : "Don't have an account?"}
                        <button onClick={toggleMode} className="toggle-button">
                            {isSignup ? 'Log In' : 'Sign Up'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
