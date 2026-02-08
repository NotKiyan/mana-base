import express from 'express';
import { getRandomCards, searchCards, getCardById, createOrUpdateCard } from '../controllers/cardController.js';

const router = express.Router();

router.get('/random', getRandomCards);
router.get('/search', searchCards);
router.get('/:id', getCardById);
router.post('/', createOrUpdateCard);
router.put('/:id', createOrUpdateCard);

export default router;
