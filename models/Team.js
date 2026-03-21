import mongoose from 'mongoose';
const teamSchema = new mongoose.Schema({
    name: String,
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    venueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    startTime: String,
    date: String,
    isLocked: { type: Boolean, default: false }
});
export default mongoose.model('Team', teamSchema);