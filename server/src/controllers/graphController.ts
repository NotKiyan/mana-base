import type { Request, Response } from 'express';
import graphService from '../services/graphService.js';

export const getCardRelationships = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (!id || Array.isArray(id)) {
            res.status(400).json({ message: 'Card ID is required' });
            return;
        }
        const details = await graphService.getCardGraphDetails(String(id));
        if (!details) {
            res.status(404).json({ message: 'Card not found in graph' });
            return;
        }
        res.json(details);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getArtistRecommendations = async (req: Request, res: Response) => {
    try {
        const { artist } = req.query;
        if (!artist) {
            res.status(400).json({ message: 'Artist name is required' });
            return;
        }
        const artistName = Array.isArray(artist) ? String(artist[0]) : String(artist);
        const cards = await graphService.getArtistRecommendations(artistName);
        res.json(cards);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export default {
    getCardRelationships,
    getArtistRecommendations
};
