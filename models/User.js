import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    sports: [{ type: String }], // Added this!
    sportLevels: { type: Map, of: String }, // Added this!
    level: { type: String, default: 'Beginner' },
    reliabilityScore: { type: Number, default: 100 },
    matchesPlayed: { type: Number, default: 0 }, // Added this!
    profileComplete: { type: Boolean, default: false } // Changed to false so the setup screen works properly
}, { timestamps: true });

export default mongoose.model('User', userSchema);