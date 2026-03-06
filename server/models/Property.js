import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Property title is required'],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    type: {
        type: String,
        required: [true, 'Property type is required'],
        enum: ['1RK', '1BHK', '2BHK', '3BHK', '4BHK', '5BHK', 'Penthouse', 'Villa', 'Plot', 'Commercial', 'Office', 'Shop', 'Other'],
    },
    transactionType: {
        type: String,
        enum: ['Sale', 'Rent', 'Lease'],
        default: 'Sale',
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
    },
    carpetArea: {
        type: Number,
        required: [true, 'Carpet area is required'],
    },
    builtUpArea: {
        type: Number,
    },
    location: {
        neighborhood: {
            type: String,
            required: [true, 'Neighborhood is required'],
            trim: true,
        },
        city: {
            type: String,
            required: [true, 'City is required'],
            trim: true,
        },
        state: {
            type: String,
            trim: true,
        },
        pincode: {
            type: String,
            trim: true,
        },
    },
    floor: {
        type: Number,
    },
    totalFloors: {
        type: Number,
    },
    furnishing: {
        type: String,
        enum: ['Unfurnished', 'Semi-Furnished', 'Fully-Furnished'],
        default: 'Unfurnished',
    },
    status: {
        type: String,
        enum: ['Available', 'Sold', 'Rented', 'Under Negotiation'],
        default: 'Available',
    },
    amenities: [String],
    images: [String],
    contactName: {
        type: String,
        trim: true,
    },
    contactPhone: {
        type: String,
        trim: true,
    },
    brokerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

// Indexes for search performance
propertySchema.index({ 'location.neighborhood': 'text', 'location.city': 'text', title: 'text' });
propertySchema.index({ price: 1 });
propertySchema.index({ carpetArea: 1 });
propertySchema.index({ type: 1 });
propertySchema.index({ brokerId: 1 });
propertySchema.index({ status: 1 });

const Property = mongoose.model('Property', propertySchema);
export default Property;
