import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { verifyOtp, loginUser, registerUser, resendOtp } from '../services/api';
import { useAuth } from '../hooks/useAuthContext';
import { CountryDropdown } from 'react-country-region-selector';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import './Auth.css';

/* ─── Shared OTP Timer Hook ─── */
const useOtpTimer = (initialSeconds = 120) => {
    const [timeLeft, setTimeLeft] = useState(initialSeconds);
    const [canResend, setCanResend] = useState(false);
    const intervalRef = useRef(null);

    const startTimer = useCallback(() => {
        setTimeLeft(initialSeconds);
        setCanResend(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        // Enable resend after 30 seconds
        setTimeout(() => setCanResend(true), 30000);
    }, [initialSeconds]);

    useEffect(() => () => clearInterval(intervalRef.current), []);

    const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    return { timeLeft, canResend, startTimer, formatTime };
};

/* ─── OTP Input ─── */
const OtpInput = ({ value, onChange }) => {
    const inputsRef = useRef([]);

    const handleChange = (index, e) => {
        const val = e.target.value.replace(/\D/g, '');
        if (!val && e.nativeEvent.inputType !== 'deleteContentBackward') return;
        const newOtp = value.split('');
        newOtp[index] = val.slice(-1);
        const joined = newOtp.join('');
        onChange(joined);
        if (val && index < 5) inputsRef.current[index + 1]?.focus();
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !value[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        onChange(pasted.padEnd(6, ''));
        const focusIdx = Math.min(pasted.length, 5);
        inputsRef.current[focusIdx]?.focus();
    };

    return (
        <div className="otp-input-group">
            {Array.from({ length: 6 }).map((_, i) => (
                <input
                    key={i}
                    ref={(el) => (inputsRef.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="otp-box"
                    value={value[i] || ''}
                    onChange={(e) => handleChange(i, e)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={i === 0 ? handlePaste : undefined}
                    autoFocus={i === 0}
                />
            ))}
        </div>
    );
};

/* ─── Password Input ─── */
const PasswordInput = ({ id, value, onChange, placeholder = '••••••••', label = 'Password' }) => {
    const [visible, setVisible] = useState(false);
    return (
        <div className="form-group">
            <label htmlFor={id}>{label}</label>
            <div className="password-wrapper">
                <input
                    id={id}
                    type={visible ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required
                    minLength={6}
                />
                <button type="button" className="password-toggle" onClick={() => setVisible(!visible)} tabIndex={-1}>
                    {visible ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    )}
                </button>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════
   LOGIN COMPONENT
   ═══════════════════════════════════ */
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtp, setShowOtp] = useState(false);
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const { timeLeft, canResend, startTimer, formatTime } = useOtpTimer(120);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setInfo('');
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
                setOtp('');
                startTimer();
                setInfo('OTP sent to your email. Please check your inbox.');
            } else {
                setError(err.response?.data?.message || 'Login failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;
        setError('');
        setInfo('');
        try {
            await resendOtp({ email });
            setOtp('');
            startTimer();
            setInfo('New OTP sent to your email.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-bg-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
            </div>
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">💎</div>
                    <h1>PropFlow</h1>
                    <p>Premium Real Estate Inventory</p>
                </div>
                <form onSubmit={handleSubmit} className="auth-form">
                    <h2>{showOtp ? 'Verify OTP' : 'Welcome Back'}</h2>

                    {error && <div className="auth-error"><span className="alert-icon">⚠</span> {error}</div>}
                    {info && <div className="auth-success"><span className="alert-icon">✓</span> {info}</div>}

                    {!showOtp ? (
                        <>
                            <div className="form-group">
                                <label htmlFor="login-email">Email</label>
                                <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
                            </div>
                            <PasswordInput id="login-password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </>
                    ) : (
                        <div className="otp-section">
                            <p className="otp-subtitle">Enter the 6-digit code sent to <strong>{email}</strong></p>
                            <OtpInput value={otp} onChange={setOtp} />
                            <div className="otp-timer-row">
                                <span className={`otp-timer ${timeLeft <= 30 ? 'timer-warning' : ''}`}>
                                    {timeLeft > 0 ? `Expires in ${formatTime(timeLeft)}` : 'OTP expired'}
                                </span>
                                <button type="button" className={`resend-btn ${canResend ? 'active' : ''}`} onClick={handleResend} disabled={!canResend}>
                                    {canResend ? 'Resend OTP' : 'Resend in 30s'}
                                </button>
                            </div>
                            <button type="button" className="back-link" onClick={() => { setShowOtp(false); setOtp(''); setError(''); setInfo(''); }}>
                                ← Back to login
                            </button>
                        </div>
                    )}

                    <button type="submit" className="auth-btn" disabled={loading || (showOtp && otp.length < 6)}>
                        {loading ? (
                            <span className="btn-spinner"><span className="spinner"></span> {showOtp ? 'Verifying...' : 'Signing in...'}</span>
                        ) : (
                            showOtp ? 'Verify & Login' : 'Sign In'
                        )}
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

/* ═══════════════════════════════════
   REGISTER COMPONENT
   ═══════════════════════════════════ */
const Register = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', organization: '', country: 'India' });
    const [otp, setOtp] = useState('');
    const [showOtp, setShowOtp] = useState(false);
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const { timeLeft, canResend, startTimer, formatTime } = useOtpTimer(120);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setInfo('');
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
                    setOtp('');
                    startTimer();
                    setInfo('OTP sent to your email. Please check your inbox.');
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

    const handleResend = async () => {
        if (!canResend) return;
        setError('');
        setInfo('');
        try {
            await resendOtp({ email: form.email });
            setOtp('');
            startTimer();
            setInfo('New OTP sent to your email.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-bg-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
            </div>
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">💎</div>
                    <h1>PropFlow</h1>
                    <p>Premium Real Estate Inventory</p>
                </div>
                <form onSubmit={handleSubmit} className="auth-form">
                    <h2>{showOtp ? 'Verify OTP' : 'Create Account'}</h2>

                    {error && <div className="auth-error"><span className="alert-icon">⚠</span> {error}</div>}
                    {info && <div className="auth-success"><span className="alert-icon">✓</span> {info}</div>}

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
                            <PasswordInput id="reg-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" />
                            <div className="form-group">
                                <label htmlFor="country">Country</label>
                                <CountryDropdown id="country" value={form.country} onChange={(val) => setForm({ ...form, country: val })} defaultOptionLabel="Select Country" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="phone">Phone</label>
                                <PhoneInput international defaultCountry="IN" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} placeholder="+91 98765 43210" id="phone" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="organization">Organization</label>
                                <input id="organization" name="organization" value={form.organization} onChange={handleChange} placeholder="Your Company Name" />
                            </div>
                        </>
                    ) : (
                        <div className="otp-section">
                            <p className="otp-subtitle">Enter the 6-digit code sent to <strong>{form.email}</strong></p>
                            <OtpInput value={otp} onChange={setOtp} />
                            <div className="otp-timer-row">
                                <span className={`otp-timer ${timeLeft <= 30 ? 'timer-warning' : ''}`}>
                                    {timeLeft > 0 ? `Expires in ${formatTime(timeLeft)}` : 'OTP expired'}
                                </span>
                                <button type="button" className={`resend-btn ${canResend ? 'active' : ''}`} onClick={handleResend} disabled={!canResend}>
                                    {canResend ? 'Resend OTP' : 'Resend in 30s'}
                                </button>
                            </div>
                            <button type="button" className="back-link" onClick={() => { setShowOtp(false); setOtp(''); setError(''); setInfo(''); }}>
                                ← Back to registration
                            </button>
                        </div>
                    )}

                    <button type="submit" className="auth-btn" disabled={loading || (showOtp && otp.length < 6)}>
                        {loading ? (
                            <span className="btn-spinner"><span className="spinner"></span> {showOtp ? 'Verifying...' : 'Creating Account...'}</span>
                        ) : (
                            showOtp ? 'Verify & Create Account' : 'Create Account'
                        )}
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
