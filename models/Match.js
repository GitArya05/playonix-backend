import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
    sport: { type: String, required: true },
    location: { type: String, required: true },
    time: { type: Number, required: true }, // Storing as a Unix timestamp
    playersNeeded: { type: Number, required: true },
    joinedPlayers: [{ type: String }], // Array of User IDs
    confirmedPlayers: [{ type: String }],
    createdBy: { type: String, required: true },
    status: { type: String, default: 'open' }
}, { timestamps: true });

export default mongoose.model('Match', matchSchema);