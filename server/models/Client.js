import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Client name is required'],
        trim: true,
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
    },
    preferences: {
        type: [String],       // e.g. ['2BHK', 'Andheri', '50L-80L']
        default: [],
    },
    notes: {
        type: String,
        trim: true,
    },
    brokerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

const Client = mongoose.model('Client', clientSchema);
export default Client;
