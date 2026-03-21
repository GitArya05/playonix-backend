import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'playonix_secret_key_2026';

app.use(cors());
app.use(express.json());

// --- MONGOOSE MODELS ---

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    gender: { type: String },
    mail: { type: String, required: true, unique: true },
    phoneNumber: { type: String },
    password: { type: String, required: true },
    matchesPlayed: { type: Number, default: 0 },
    ranking: { type: String, default: 'Unranked' },
    city: { type: String },
    isVenueManager: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const venueSchema = new mongoose.Schema({
    name: String,
    location: String,
    city: String,
    mapsLink: String,
    phoneNumber: String
});

const Venue = mongoose.model('Venue', venueSchema);

const teamSchema = new mongoose.Schema({
    name: String,
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    venueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    startTime: String,
    date: String,
    isLocked: { type: Boolean, default: false }
}, { timestamps: true });

const Team = mongoose.model('Team', teamSchema);

// --- MIDDLEWARE ---

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(403).json({ message: 'Token is not valid' });
    }
};

// --- API V1 ENDPOINTS ---

// 1. Signup
app.post('/api/v1/signup', async (req, res) => {
    try {
        const { name, gender, mail, phoneNumber, password, city, isVenueManager } = req.body;

        const existingUser = await User.findOne({ mail });
        if (existingUser) {
            return res.status(400).json({ message: 'user already exists please sign in' });
        }

        const newUser = new User({ name, gender, mail, phoneNumber, password, city, isVenueManager });
        await newUser.save();

        const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({ message: 'user created successfully', token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Signin
app.post('/api/v1/signin', async (req, res) => {
    try {
        const { mail, password } = req.body;
        const user = await User.findOne({ mail, password });

        if (!user) {
            return res.status(400).json({ message: 'user does not exist please sign up' });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({ message: 'user signin successful', token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. User Details
app.get('/api/v1/user-details', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Get Teams (Filtered)
app.get('/api/v1/teams', authenticateToken, async (req, res) => {
    try {
        const { city, venue } = req.query;
        let filter = {};
        if (city) filter.city = city;

        const teams = await Team.find(filter).populate('hostId venueId members');
        res.status(200).json(teams);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. Create Team
app.post('/api/v1/create-team', authenticateToken, async (req, res) => {
    try {
        const { name, venueId, date, time } = req.body;
        const newTeam = new Team({
            name,
            venueId,
            date,
            startTime: time,
            hostId: req.user.id,
            members: [req.user.id]
        });
        await newTeam.save();
        res.status(200).json({ message: 'success', teamId: newTeam._id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 6. Health Check
app.get('/api/v1/health', (req, res) => {
    res.json({
        status: 'UP',
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

// --- SERVER START ---

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB Atlas!');
        app.listen(PORT, () => console.log(`🚀 Playonix Backend v1 running on port ${PORT}`));
    })
    .catch(err => console.error('❌ Database connection failed:', err));