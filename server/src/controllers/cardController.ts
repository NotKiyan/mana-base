import type { Request, Response } from 'express';
import { Card, CardFace, Edition, Set, CardColorIdentity } from '../models/mtg.js';
import sequelize from '../models/index.js';

import { Op } from 'sequelize';

// @desc    Get random cards
// @route   GET /api/cards/random
export const getRandomCards = async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 5;

        // Fetch random editions with their associated card info
        const editions = await Edition.findAll({
            order: sequelize.random(),
            limit: limit,
            include: [
                { model: Card },
                { model: Set }
            ]
        });

        res.json(editions);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Search cards by name
// @route   GET /api/cards/search
export const searchCards = async (req: Request, res: Response) => {
    try {
        const query = req.query.q as string;

        if (!query) {
            res.status(400).json({ message: 'Search query is required' });
            return;
        }

        const editions = await Edition.findAll({
            include: [
                {
                    model: Card,
                    where: {
                        name: { [Op.iLike]: `%${query}%` }
                    },
                    include: [{ model: CardFace }]
                },
                { model: Set }
            ],
            limit: 20
        });

        res.json(editions);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get card by ID
// @route   GET /api/cards/:id
export const getCardById = async (req: Request, res: Response) => {
    try {
        const card = await Card.findByPk(req.params.id as string, {
            include: [
                { model: CardFace },
                { model: CardColorIdentity },
                {
                    model: Edition,
                    include: [{ model: Set }]
                }
            ]
        });

        if (!card) {
            res.status(404).json({ message: 'Card not found' });
            return;
        }

        res.json(card);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create or update a card
// @route   POST /api/cards
export const createOrUpdateCard = async (req: Request, res: Response) => {
    const transaction = await sequelize.transaction();
    try {
        const {
            card_id, oracle_id, name, layout, reserved_list,
            set_code, set_name, release_date, set_type,
            edition_id, rarity, artist, collector_number, image_url_normal, image_url_small,
            faces,
            color_identity
        } = req.body;

        const finalCardId = card_id || oracle_id;

        // 1. Ensure Set exists
        if (set_code) {
            await Set.upsert({
                set_code: set_code,
                set_name: set_name || 'Unknown Set',
                release_date: release_date || null,
                set_type: set_type || 'core'
            }, { transaction });
        }

        // 2. Create/Update Card
        await Card.upsert({
            card_id: finalCardId,
            oracle_id: oracle_id || finalCardId,
            name: name,
            layout: layout || 'normal',
            reserved_list: reserved_list || false
        }, { transaction });

        // 3. Create/Update Edition
        if (edition_id) {
            await Edition.upsert({
                edition_id: edition_id,
                card_id: finalCardId,
                set_code: set_code,
                rarity: rarity || 'common',
                artist: artist || 'Unknown',
                collector_number: collector_number || '0',
                image_url_normal: image_url_normal || '',
                image_url_small: image_url_small || ''
            }, { transaction });
        }

        // 4. Handle Faces
        if (faces && Array.isArray(faces)) {
            await CardFace.destroy({ where: { card_id: finalCardId }, transaction });
            for (let i = 0; i < faces.length; i++) {
                const face = faces[i];
                await CardFace.create({
                    card_id: finalCardId,
                    face_index: i,
                    name: face.name || name,
                    mana_cost: face.mana_cost || '',
                    cmc: face.cmc || 0,
                    oracle_text: face.oracle_text || '',
                    flavor_text: face.flavor_text || '',
                    power: face.power || null,
                    toughness: face.toughness || null
                }, { transaction });
            }
        }

        // 5. Handle Color Identity
        if (color_identity && Array.isArray(color_identity)) {
            await CardColorIdentity.destroy({ where: { card_id: finalCardId }, transaction });
            for (const colorId of color_identity) {
                await CardColorIdentity.create({
                    card_id: finalCardId,
                    color_id: colorId
                }, { transaction });
            }
        }

        await transaction.commit();
        res.status(201).json({ message: 'Card processed successfully' });
    } catch (error: any) {
        await transaction.rollback();
        console.error('Error in createOrUpdateCard:', error);
        res.status(500).json({ message: error.message });
    }
};
