import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
    // TEMPORARY: bypass auth
    req.user = { _id: '000000000000000000000000', role: 'broker', plan: 'Enterprise' };
    return next();

    /*
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized, token invalid' });
    }
    */
};

// Check plan limits before adding properties
export const checkPlanLimits = async (req, res, next) => {
    // TEMPORARY: bypass limits
    return next();

    /*
    try {
        const user = req.user;

        if (!user.canAddProperty()) {
            return res.status(403).json({
                message: `Property limit reached for your ${user.plan} plan. Please upgrade to add more properties.`,
                currentCount: user.propertyCount,
                planLimit: User.PLAN_LIMITS[user.plan].maxProperties,
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({ message: 'Server error checking plan limits' });
    }
    */
};
