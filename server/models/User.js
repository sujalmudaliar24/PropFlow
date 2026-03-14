import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const PLAN_LIMITS = {
    Starter: { maxProperties: 200, maxUsers: 1 },
    Professional: { maxProperties: 2000, maxUsers: 5 },
    Enterprise: { maxProperties: Infinity, maxUsers: Infinity },
};

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false,
    },
    phone: {
        type: String,
        trim: true,
    },
    plan: {
        type: String,
        enum: ['Starter', 'Professional', 'Enterprise'],
        default: 'Starter',
    },
    propertyCount: {
        type: Number,
        default: 0,
    },
    organization: {
        type: String,
        trim: true,
    },
    country: {
        type: String,
        trim: true,
        default: '',
    },
    otp: {
        type: String,
    },
    otpExpires: {
        type: Date,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Check plan limits
userSchema.methods.canAddProperty = function () {
    const limits = PLAN_LIMITS[this.plan];
    return this.propertyCount < limits.maxProperties;
};

userSchema.statics.PLAN_LIMITS = PLAN_LIMITS;

const User = mongoose.model('User', userSchema);
export default User;
