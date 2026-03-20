// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import our new Models
import User from './models/User.js';
import Match from './models/Match.js';

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas!'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));


// --- AUTHENTICATION ROUTES ---

// 1. Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, phone } = req.body;

        // Check if user exists in the database
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'Email already registered' });

        // Save new user to database
        const newUser = await User.create({ name, email, phone });

        // Send back the user data (converting the DB _id to a string so React can read it)
        res.status(201).json({ ...newUser._doc, id: newUser._id.toString() });
    } catch (error) {
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// 2. Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ ...user._doc, id: user._id.toString() });
    } catch (error) {
        res.status(500).json({ error: 'Server error during login' });
    }
});


// --- MATCH ROUTES ---

// 3. Get all matches
app.get('/api/matches', async (req, res) => {
    try {
        const matches = await Match.find().sort({ time: 1 }); // Sort by soonest matches first

        // Format the IDs for the frontend before sending
        const formattedMatches = matches.map(m => ({ ...m._doc, id: m._id.toString() }));
        res.json(formattedMatches);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch matches' });
    }
});

// 4. Create a match
app.post('/api/matches', async (req, res) => {
    try {
        const newMatch = await Match.create(req.body);
        res.status(201).json({ ...newMatch._doc, id: newMatch._id.toString() });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create match' });
    }
});

// --- MISSING ROUTES ---

// 5. Update Match (Join/Confirm)
app.put('/api/matches/:id', async (req, res) => {
    try {
        const updatedMatch = await Match.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedMatch) return res.status(404).json({ error: 'Match not found' });
        res.json({ ...updatedMatch._doc, id: updatedMatch._id.toString() });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update match' });
    }
});

// 6. Fetch All Users
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        const formattedUsers = users.map(u => ({ ...u._doc, id: u._id.toString() }));
        res.json(formattedUsers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});
// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Playonix Backend running on http://localhost:${PORT}`);
});