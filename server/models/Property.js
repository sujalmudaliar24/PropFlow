import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    propertyType: {
        type: String,
        required: [true, 'Property type is required'],
        enum: ['Residential', 'Commercial'],
    },
    subType: {
        type: String,
        required: [true, 'Sub-type is required'],
        // enum: ['Villa', 'Apartment', 'Penthouse', 'Others', 'Office Space', 'Plot']
    },
    transactionType: {
        type: String,
        enum: ['Sale', 'Rent'],
        required: [true, 'Transaction type is required'],
    },
    location: {
        city: { type: String, required: [true, 'City is required'], trim: true },
        area: { type: String, required: [true, 'Area/Locality is required'], trim: true },
        society: { type: String, required: [true, 'Society/Building name is required'], trim: true },
        address: { type: String, required: [true, 'Address is required'], trim: true },
        pincode: { type: String, required: [true, 'Pincode is required'], trim: true },
        landmark: { type: String, trim: true },
    },
    specifications: {
        carpetArea: { type: Number, required: [true, 'Carpet area is required'] },
        builtUpArea: { type: Number },
        floorNumber: { type: Number, required: [true, 'Floor number is required'] },
        totalFloors: { type: Number, required: [true, 'Total floors is required'] },
        bedrooms: { type: Number, required: [true, 'Number of bedrooms is required'] },
        bathrooms: { type: Number, required: [true, 'Number of bathrooms is required'] },
        balcony: { type: Number },
        furnishingType: {
            type: String,
            required: [true, 'Furnishing type is required'],
            enum: ['Unfurnished', 'Semi Furnished', 'Fully Furnished'],
        },
    },
    parking: {
        type: {
            type: String,
            enum: ['basement', 'ramp', 'stilt', 'automatic', 'open'],
        },
        count: { type: Number },
    },
    pricing: {
        // For Rent
        rentAmount: { type: Number },
        securityDeposit: { type: Number },
        // For Sale
        cost: { type: Number },
        negotiable: { type: Boolean, default: true },
        // Common
        brokerage: { type: Number, required: [true, 'Brokerage is required'] },
    },
    keywords: [String],
    images: [String],
    status: {
        type: String,
        enum: ['Available', 'Sold', 'Rented', 'Under Negotiation'],
        default: 'Available',
    },
    brokerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

// Indexes for search performance
propertySchema.index({ 'location.society': 'text', 'location.area': 'text', 'location.city': 'text', title: 'text', keywords: 'text' });
propertySchema.index({ 'pricing.cost': 1 });
propertySchema.index({ 'pricing.rentAmount': 1 });
propertySchema.index({ 'specifications.carpetArea': 1 });
propertySchema.index({ propertyType: 1 });
propertySchema.index({ brokerId: 1 });
propertySchema.index({ status: 1 });

const Property = mongoose.model('Property', propertySchema);
export default Property;
