console.log('Starting server...');
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import connectDB from './config/mongo.js';
import sequelize from './models/index.js';
import authRoutes from './routes/authRoutes.js';
import cardRoutes from './routes/cardRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
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

// Static Assets
// Assuming 'server' is cwd, and 'public' is one level up from 'server' OR inside 'server'?
// Structure: /home/charan/Repos/mana base/
//   - public/
//   - server/
//     - src/
// So public is ../../public from src/index.ts?
// Let's resolve relative to the project root.
const PROJECT_ROOT = path.join(__dirname, '../../');
app.use('/assets', express.static(path.join(PROJECT_ROOT, 'public/assets')));
app.use('/icons', express.static(path.join(PROJECT_ROOT, 'Icons')));
// Also serve the Stitch frontend if needed? 
// User said: "Configure the backend to serve the sample card images and mana icons as static assets"
// Stitch frontend is in `frontend/`. Usually we serve the build, but for now let's just serve assets.

// Database Connections
const startServer = async () => {
    try {
        // Connect MongoDB
        await connectDB();

        // Connect PostgreSQL
        await sequelize.authenticate();
        console.log('PostgreSQL Connected');

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Serving static assets from ${path.join(PROJECT_ROOT, 'public/assets')}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
    }
};

startServer();
