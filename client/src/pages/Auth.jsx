import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, registerUser, verifyOtp } from '../services/api';
import { useAuth } from '../hooks/useAuthContext';
import { CountryDropdown } from 'react-country-region-selector';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtp, setShowOtp] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (showOtp) {
                const { data } = await verifyOtp({ email, otp });
                login(data);
                navigate('/dashboard');
            } else {
                const { data } = await loginUser({ email, password });
                login(data);
                navigate('/dashboard');
            }
        } catch (err) {
            if (err.response?.status === 403 && err.response?.data?.requiresOtp) {
                setShowOtp(true);
                setError(err.response?.data?.message || 'Please check your email for the OTP.');
            } else {
                setError(err.response?.data?.message || 'Login failed');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">💎</div>
                    <h1>PropFlow</h1>
                    <p>Premium Real Estate Inventory</p>
                </div>
                <form onSubmit={handleSubmit} className="auth-form">
                    <h2>{showOtp ? 'Verify OTP' : 'Welcome Back'}</h2>
                    {error && <div className="auth-error">{error}</div>}
                    
                    {!showOtp ? (
                        <>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@company.com"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </>
                    ) : (
                        <div className="form-group">
                            <label htmlFor="otp">Enter 6-digit OTP</label>
                            <input
                                id="otp"
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="123456"
                                maxLength="6"
                                required
                            />
                        </div>
                    )}

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading 
                            ? (showOtp ? 'Verifying...' : 'Signing in...') 
                            : (showOtp ? 'Verify & Login' : 'Sign In')}
                    </button>
                    {!showOtp && (
                        <p className="auth-switch">
                            Don't have an account? <Link to="/register">Create one</Link>
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
};

const Register = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', organization: '', country: 'India' });
    const [otp, setOtp] = useState('');
    const [showOtp, setShowOtp] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (showOtp) {
                const { data } = await verifyOtp({ email: form.email, otp });
                login(data);
                navigate('/dashboard');
            } else {
                const { data } = await registerUser(form);
                if (data.requiresOtp) {
                    setShowOtp(true);
                    setError(data.message || 'OTP sent to your email.'); // Used as an info message visually for now
                } else {
                    login(data);
                    navigate('/dashboard');
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">💎</div>
                    <h1>PropFlow</h1>
                    <p>Premium Real Estate Inventory</p>
                </div>
                <form onSubmit={handleSubmit} className="auth-form">
                    <h2>{showOtp ? 'Verify OTP' : 'Create Account'}</h2>
                    {error && <div className="auth-error" style={showOtp && error.includes('OTP sent') ? { background: '#dcfce7', color: '#166534', borderColor: '#bbf7d0' } : {}}>{error}</div>}
                    
                    {!showOtp ? (
                        <>
                            <div className="form-group">
                                <label htmlFor="name">Full Name</label>
                                <input id="name" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="reg-email">Email</label>
                                <input id="reg-email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@company.com" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="reg-password">Password</label>
                                <input id="reg-password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="country">Country</label>
                                <CountryDropdown
                                    id="country"
                                    value={form.country}
                                    onChange={(val) => setForm({ ...form, country: val })}
                                    defaultOptionLabel="Select Country"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="phone">Phone</label>
                                <input id="phone" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="organization">Organization</label>
                                <input id="organization" name="organization" value={form.organization} onChange={handleChange} placeholder="Your Company Name" />
                            </div>
                        </>
                    ) : (
                        <div className="form-group">
                            <label htmlFor="otp-reg">Enter 6-digit OTP</label>
                            <input
                                id="otp-reg"
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="123456"
                                maxLength="6"
                                required
                            />
                        </div>
                    )}

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading 
                            ? (showOtp ? 'Verifying...' : 'Creating Account...') 
                            : (showOtp ? 'Verify & Create Account' : 'Create Account')}
                    </button>
                    {!showOtp && (
                        <p className="auth-switch">
                            Already have an account? <Link to="/login">Sign In</Link>
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
};

export { Login, Register };
