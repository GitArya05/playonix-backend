import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // 'mail' in your friend's list
    password: { type: String, required: true },
    gender: { type: String },
    phone: { type: String },
    city: { type: String },
    isVenueManager: { type: Boolean, default: false },
    matchesPlayed: { type: Number, default: 0 },
    ranking: { type: String, default: 'Unranked' },
}, { timestamps: true });

export default mongoose.model('User', userSchema);