import type { Request, Response } from 'express';
import { Set, Edition, Card, CardFace } from '../models/mtg.js';
import sequelize from '../models/index.js';
import { fn, col, literal, Op } from 'sequelize';

// @desc    Get all sets with card counts + hierarchy info from DB
// @route   GET /api/sets
export const getAllSets = async (req: Request, res: Response) => {
    try {
        const sortBy = (req.query.sort as string) || 'release_date';
        const order = (req.query.order as string) || 'DESC';

        const sets = await Set.findAll({
            attributes: [
                'set_code',
                'set_name',
                'release_date',
                'set_type',
                'parent_set_code',
                'icon_svg_uri',
                'digital',
                'card_count',
                'block_name',
                'block_code',
                'nonfoil_only',
                'foil_only',
                [fn('COUNT', col('Editions.edition_id')), 'edition_count']
            ],
            include: [{
                model: Edition,
                attributes: [],
            }],
            group: ['Set.set_code'],
            order: [[sortBy, order]],
            raw: true,
            subQuery: false,
        });

        res.json(sets);
    } catch (error: any) {
        console.error('Error in getAllSets:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get set by code with all cards
// @route   GET /api/sets/:code
export const getSetByCode = async (req: Request, res: Response) => {
    try {
        const setCode = req.params.code as string;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 60;
        const offset = (page - 1) * limit;
        const sortBy = (req.query.sort as string) || 'collector_number';
        const order = (req.query.order as string) || 'ASC';

        // Get the set info with edition count
        const set = await Set.findByPk(setCode, {
            attributes: [
                'set_code',
                'set_name',
                'release_date',
                'set_type',
                'parent_set_code',
                'icon_svg_uri',
                'digital',
                'card_count',
                'block_name',
                'block_code',
                'nonfoil_only',
                'foil_only',
                [
                    literal(`(SELECT COUNT(*) FROM edition WHERE edition.set_code = "Set".set_code)`),
                    'edition_count'
                ]
            ]
        });

        if (!set) {
            res.status(404).json({ message: 'Set not found' });
            return;
        }

        // Get child sets (sub-sets)
        const childSets = await Set.findAll({
            where: { parent_set_code: setCode },
            attributes: ['set_code', 'set_name', 'set_type', 'icon_svg_uri', 'card_count'],
            order: [['release_date', 'DESC']],
        });

        // Get cards in this set
        const { count, rows: editions } = await Edition.findAndCountAll({
            where: { set_code: setCode },
            attributes: [
                'edition_id', 'card_id', 'set_code', 'rarity',
                'collector_number', 'image_url_small', 'image_url_normal', 'artist'
            ],
            include: [
                {
                    model: Card,
                    attributes: ['card_id', 'name']
                }
            ],
            order: [[sortBy, order]],
            limit,
            offset
        });

        res.json({
            set,
            childSets,
            cards: editions,
            pagination: {
                page,
                limit,
                total: count,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error: any) {
        console.error('Error in getSetByCode:', error);
        res.status(500).json({ message: error.message });
    }
};
