import express from 'express';
import {
    getRandomCards,
    searchCards,
    getCardById,
    createOrUpdateCard,
    deleteCard,
    getEditionsByCardId,
    createEdition,
    updateEdition,
    deleteEdition,
    bulkAddEditions,
    upsertEditionPrice
} from '../controllers/cardController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/random', getRandomCards);
router.get('/search', searchCards);
router.get('/:id', getCardById);

// Protected Admin Routes
router.post('/', protect, adminOnly, createOrUpdateCard);
router.put('/:id', protect, adminOnly, createOrUpdateCard);
router.delete('/:id', protect, adminOnly, deleteCard);

// Edition Management
router.get('/:id/editions', protect, adminOnly, getEditionsByCardId);
router.post('/editions', protect, adminOnly, createEdition);
router.put('/editions/:id', protect, adminOnly, updateEdition);
router.delete('/editions/:id', protect, adminOnly, deleteEdition);
router.post('/editions/bulk', protect, adminOnly, bulkAddEditions);
router.post('/editions/price', protect, adminOnly, upsertEditionPrice);

export default router;
