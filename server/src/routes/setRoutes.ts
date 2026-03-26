import express from 'express';
import { getAllSets, getSetByCode } from '../controllers/setController.js';

const router = express.Router();

// GET /api/sets - Get all sets with card counts + hierarchy info
router.get('/', getAllSets);

// GET /api/sets/:code - Get set by code with cards + child sets
router.get('/:code', getSetByCode);

export default router;
