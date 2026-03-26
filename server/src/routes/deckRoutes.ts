import express from 'express';
import {
    createDeck,
    getDecks,
    getDeckById,
    updateDeck,
    deleteDeck,
} from '../controllers/deckController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All deck routes require authentication
router.use(protect as any);

router.route('/')
    .get(getDecks)
    .post(createDeck);

router.route('/:id')
    .get(getDeckById)
    .put(updateDeck)
    .delete(deleteDeck);

export default router;
