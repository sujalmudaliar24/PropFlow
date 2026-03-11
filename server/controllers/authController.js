import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// @desc    Register a new user
// @route   POST /api/auth/register
export const register = async (req, res) => {
    try {
        const { name, email, password, phone, organization, country } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            if (user.isVerified) {
                return res.status(400).json({ message: 'User with this email already exists' });
            }
            // Update unverified user's new attempt
            user.password = password;
            user.name = name;
        } else {
            user = await User.create({ name, email, password, phone, organization, country, isVerified: false });
        }

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        await sendEmail({
            email: user.email,
            subject: 'PropFlow - Verify Your Account',
            message: `Your OTP for registration is ${otp}. It is valid for 10 minutes.`,
        });

        res.status(201).json({ message: 'OTP sent to your email', email: user.email, requiresOtp: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            plan: user.plan,
            propertyCount: user.propertyCount,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (!user.isVerified) {
            const otp = generateOTP();
            user.otp = otp;
            user.otpExpires = Date.now() + 10 * 60 * 1000;
            await user.save();

            await sendEmail({
                email: user.email,
                subject: 'PropFlow - Verify Your Account',
                message: `Your OTP for login is ${otp}. It is valid for 10 minutes.`,
            });

            return res.status(403).json({ requiresOtp: true, email: user.email, message: 'Please verify your email.' });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            plan: user.plan,
            propertyCount: user.propertyCount,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            plan: user.plan,
            propertyCount: user.propertyCount,
            organization: user.organization,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
