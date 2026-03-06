import Property from '../models/Property.js';
import User from '../models/User.js';

// @desc    Create a new property
// @route   POST /api/properties
export const createProperty = async (req, res) => {
    try {
        const property = await Property.create({
            ...req.body,
            brokerId: req.user._id,
        });

        // Increment user's property count
        await User.findByIdAndUpdate(req.user._id, { $inc: { propertyCount: 1 } });

        res.status(201).json(property);
    } catch (error) {
        console.error('Create property error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all properties for the logged-in broker
// @route   GET /api/properties
export const getProperties = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const properties = await Property.find({ brokerId: req.user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Property.countDocuments({ brokerId: req.user._id });

        res.json({
            properties,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalProperties: total,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Search & filter properties
// @route   GET /api/properties/search
export const searchProperties = async (req, res) => {
    try {
        const {
            q,              // text search query
            type,           // property type: 1BHK, 2BHK etc.
            minPrice,
            maxPrice,
            minArea,
            maxArea,
            neighborhood,
            city,
            transactionType,
            furnishing,
            status,
            page = 1,
            limit = 20,
        } = req.query;

        const filter = { brokerId: req.user._id };

        // Text search (location + title)
        if (q) {
            filter.$or = [
                { 'location.neighborhood': { $regex: q, $options: 'i' } },
                { 'location.city': { $regex: q, $options: 'i' } },
                { title: { $regex: q, $options: 'i' } },
            ];
        }

        if (type) filter.type = type;
        if (transactionType) filter.transactionType = transactionType;
        if (furnishing) filter.furnishing = furnishing;
        if (status) filter.status = status || 'Available';

        if (neighborhood) {
            filter['location.neighborhood'] = { $regex: neighborhood, $options: 'i' };
        }
        if (city) {
            filter['location.city'] = { $regex: city, $options: 'i' };
        }

        // Price range
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        // Area range
        if (minArea || maxArea) {
            filter.carpetArea = {};
            if (minArea) filter.carpetArea.$gte = Number(minArea);
            if (maxArea) filter.carpetArea.$lte = Number(maxArea);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const properties = await Property.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Property.countDocuments(filter);

        res.json({
            properties,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalProperties: total,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single property
// @route   GET /api/properties/:id
export const getProperty = async (req, res) => {
    try {
        const property = await Property.findOne({
            _id: req.params.id,
            brokerId: req.user._id,
        });

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        res.json(property);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update property
// @route   PUT /api/properties/:id
export const updateProperty = async (req, res) => {
    try {
        const property = await Property.findOneAndUpdate(
            { _id: req.params.id, brokerId: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        res.json(property);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
export const deleteProperty = async (req, res) => {
    try {
        const property = await Property.findOneAndDelete({
            _id: req.params.id,
            brokerId: req.user._id,
        });

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Decrement user's property count
        await User.findByIdAndUpdate(req.user._id, { $inc: { propertyCount: -1 } });

        res.json({ message: 'Property deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Generate WhatsApp message for selected properties
// @route   POST /api/properties/share
export const generateWhatsAppMessage = async (req, res) => {
    try {
        const { propertyIds, clientPhone, clientName } = req.body;

        if (!propertyIds || propertyIds.length === 0) {
            return res.status(400).json({ message: 'No properties selected' });
        }

        const properties = await Property.find({
            _id: { $in: propertyIds },
            brokerId: req.user._id,
        });

        if (properties.length === 0) {
            return res.status(404).json({ message: 'No properties found' });
        }

        // Build formatted message
        let message = `Hi ${clientName || 'there'}! 🏠\n\n`;
        message += `Here are some properties matching your requirements:\n\n`;

        properties.forEach((prop, index) => {
            const priceFormatted = prop.price >= 10000000
                ? `₹${(prop.price / 10000000).toFixed(2)} Cr`
                : prop.price >= 100000
                    ? `₹${(prop.price / 100000).toFixed(2)} Lac`
                    : `₹${prop.price.toLocaleString('en-IN')}`;

            message += `*${index + 1}. ${prop.type} - ${prop.location.neighborhood}, ${prop.location.city}*\n`;
            message += `   💰 Price: ${priceFormatted}\n`;
            message += `   📐 Carpet Area: ${prop.carpetArea} sq.ft\n`;
            if (prop.floor) message += `   🏢 Floor: ${prop.floor}/${prop.totalFloors || '-'}\n`;
            message += `   🏷️ ${prop.transactionType} | ${prop.furnishing}\n`;
            message += `   📍 Status: ${prop.status}\n\n`;
        });

        message += `_Shared via PropFlow_`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = clientPhone
            ? `https://wa.me/${clientPhone}?text=${encodedMessage}`
            : `https://wa.me/?text=${encodedMessage}`;

        res.json({
            message,
            whatsappUrl,
            propertyCount: properties.length,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
