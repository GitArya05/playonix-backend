import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    level: { type: String, default: 'Beginner' },
    reliabilityScore: { type: Number, default: 100 },
    profileComplete: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('User', userSchema);