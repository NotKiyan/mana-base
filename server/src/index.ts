console.log('Starting server... (v2.1 - Persistence Fixed)');
// Force restart
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import connectDB from './config/mongo.js';
import sequelize from './models/index.js';
import authRoutes from './routes/authRoutes.js';
import cardRoutes from './routes/cardRoutes.js';
import setRoutes from './routes/setRoutes.js';
import deckRoutes from './routes/deckRoutes.js';
import graphRoutes from './routes/graphRoutes.js';
import userRoutes from './routes/userRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware - CORS configuration for development and production
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL || 'https://mana-nexus.azurewebsites.net'
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security Check
if (!process.env.JWT_SECRET) {
    console.error('CRITICAL ERROR: JWT_SECRET is not defined in .env');
    process.exit(1);
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/sets', setRoutes);
app.use('/api/decks', deckRoutes);
app.use('/api/graph', graphRoutes);
app.use('/api/user', userRoutes);

// Static Assets
const PROJECT_ROOT = path.join(__dirname, '../../');
app.use('/assets', express.static(path.join(PROJECT_ROOT, 'public/assets')));
app.use('/icons', express.static(path.join(PROJECT_ROOT, 'Icons')));

// Serve frontend build in production
const frontendBuildPath = path.join(PROJECT_ROOT, 'frontend/dist');
app.use(express.static(frontendBuildPath));

// Catch-all route to serve index.html for client-side routing
// Express 5 requires {*path} syntax for wildcards
app.get('/{*path}', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
        res.status(404).json({ message: 'API endpoint not found' });
        return;
    }
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

// Database Connections
const startServer = async () => {
    // Start listening FIRST (Azure requires this within 230 seconds)
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Serving static assets from ${path.join(PROJECT_ROOT, 'public/assets')}`);
    });

    // Connect to databases in background (non-blocking)
    try {
        console.log('Connecting to MongoDB...');
        await connectDB();
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB connection failed:', err);
        console.log('Server will continue running without MongoDB');
    }

    try {
        console.log('Connecting to PostgreSQL...');
        await sequelize.authenticate();
        console.log('PostgreSQL Connected');
    } catch (err) {
        console.error('PostgreSQL connection failed:', err);
        console.log('Server will continue running without PostgreSQL');
    }
};

startServer();
