import express from 'express';
import { getRandomCards, searchCards, getCardById, createOrUpdateCard } from '../controllers/cardController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/random', getRandomCards);
router.get('/search', searchCards);
router.get('/:id', getCardById);

// Protected routes
router.post('/', protect, adminOnly, createOrUpdateCard);
router.put('/:id', protect, adminOnly, createOrUpdateCard);

export default router;
