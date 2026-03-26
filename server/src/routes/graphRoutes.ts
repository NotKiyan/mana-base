import express from 'express';
import graphController from '../controllers/graphController.js';

const router = express.Router();

// GET /api/graph/card/:id - Get melds, printings, and artist details
router.get('/card/:id', graphController.getCardRelationships);

// GET /api/graph/artist - Get cards by artist
router.get('/artist', graphController.getArtistRecommendations);

export default router;
