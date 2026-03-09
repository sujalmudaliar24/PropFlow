import express from 'express';
import {
    createProperty,
    getProperties,
    searchProperties,
    getProperty,
    updateProperty,
    deleteProperty,
    generateWhatsAppMessage,
} from '../controllers/propertyController.js';
import { protect, checkPlanLimits } from '../middleware/auth.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/search', searchProperties);
router.post('/share', generateWhatsAppMessage);

router.route('/')
    .get(getProperties)
    .post(checkPlanLimits, upload.array('images', 10), createProperty);

router.route('/:id')
    .get(getProperty)
    .put(upload.array('images', 10), updateProperty)
    .delete(deleteProperty);

export default router;
