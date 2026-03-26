import type { Response } from 'express';
import type { AuthRequest } from '../middleware/authMiddleware.js';
import { Decklist, DeckEntry, Card, CardFace } from '../models/mtg.js';
import sequelize from '../models/index.js';

// @desc    Create a new deck
// @route   POST /api/decks
// @access  Private
export const createDeck = async (req: AuthRequest, res: Response) => {
    const t = await sequelize.transaction();
    try {
        const { name, description, format, cards, isPublic } = req.body;

        const deck = await Decklist.create({
            user_id: req.user._id.toString(),
            deck_name: name || 'New Deck',
            is_public: isPublic || false,
            // tournament_id: null, etc.
        }, { transaction: t });

        if (cards && cards.length > 0) {
            const entries = cards.map((c: any) => ({
                decklist_id: deck.decklist_id,
                card_id: c.card_id,
                quantity: c.quantity || 1,
                is_sideboard: c.column === 'side'
            }));
            await DeckEntry.bulkCreate(entries, { transaction: t });
        }

        await t.commit();
        res.status(201).json(deck);
    } catch (error: any) {
        await t.rollback();
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all decks for the logged-in user
// @route   GET /api/decks
// @access  Private
export const getDecks = async (req: AuthRequest, res: Response) => {
    try {
        const decks = await Decklist.findAll({
            where: { user_id: req.user._id.toString() },
            include: [{
                model: DeckEntry,
                as: 'entries',
                include: [{
                    model: Card,
                    include: [CardFace]
                }]
            }]
        });

        // Map behavior to match old Mongo output if necessary
        const formattedDecks = decks.map((d: any) => {
            const deck = d.toJSON();
            return {
                _id: deck.decklist_id,
                name: deck.deck_name,
                isPublic: deck.is_public,
                cards: deck.entries.map((e: any) => ({
                    card_id: e.card_id,
                    name: e.Card.name,
                    quantity: e.quantity,
                    column: e.is_sideboard ? 'side' : 'main',
                    // Optional: map other card details
                    mana_cost: e.Card.CardFaces?.[0]?.mana_cost,
                    cmc: e.Card.CardFaces?.[0]?.cmc
                }))
            };
        });

        res.json(formattedDecks);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single deck by ID
// @route   GET /api/decks/:id
// @access  Private
export const getDeckById = async (req: AuthRequest, res: Response) => {
    try {
        const deck: any = await Decklist.findByPk(req.params.id as any, {
            include: [{
                model: DeckEntry,
                as: 'entries',
                include: [{
                    model: Card,
                    include: [CardFace]
                }]
            }]
        });

        if (!deck) {
            res.status(404).json({ message: 'Deck not found' });
            return;
        }

        if (deck.user_id !== req.user._id.toString() && !deck.is_public) {
            res.status(403).json({ message: 'Not authorized to view this deck' });
            return;
        }

        // Format for frontend compatibility
        const formattedDeck = {
            _id: deck.decklist_id,
            name: deck.deck_name,
            isPublic: deck.is_public,
            cards: deck.entries.map((e: any) => ({
                card_id: e.card_id,
                name: e.Card.name,
                quantity: e.quantity,
                column: e.is_sideboard ? 'side' : 'main',
                mana_cost: e.Card.CardFaces?.[0]?.mana_cost,
                cmc: e.Card.CardFaces?.[0]?.cmc
            }))
        };

        res.json(formattedDeck);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update an existing deck
// @route   PUT /api/decks/:id
// @access  Private
export const updateDeck = async (req: AuthRequest, res: Response) => {
    const t = await sequelize.transaction();
    try {
        const deck = await Decklist.findByPk(req.params.id as any);

        if (!deck) {
            res.status(404).json({ message: 'Deck not found' });
            return;
        }

        if (deck.user_id !== req.user._id.toString()) {
            res.status(403).json({ message: 'Not authorized to update this deck' });
            return;
        }

        const { name, isPublic, cards } = req.body;

        if (name !== undefined) deck.deck_name = name;
        if (isPublic !== undefined) deck.is_public = isPublic;
        await deck.save({ transaction: t });

        if (cards !== undefined) {
            // Re-sync entries: delete old and insert new
            await DeckEntry.destroy({
                where: { decklist_id: deck.decklist_id },
                transaction: t
            });

            if (cards.length > 0) {
                const entries = cards.map((c: any) => ({
                    decklist_id: deck.decklist_id,
                    card_id: c.card_id,
                    quantity: c.quantity || 1,
                    is_sideboard: c.column === 'side'
                }));
                await DeckEntry.bulkCreate(entries, { transaction: t });
            }
        }

        await t.commit();
        res.json({ message: 'Deck updated successfully', decklist_id: deck.decklist_id });
    } catch (error: any) {
        await t.rollback();
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a deck
// @route   DELETE /api/decks/:id
// @access  Private
export const deleteDeck = async (req: AuthRequest, res: Response) => {
    try {
        const deck = await Decklist.findByPk(req.params.id as any);

        if (!deck) {
            res.status(404).json({ message: 'Deck not found' });
            return;
        }

        if (deck.user_id !== req.user._id.toString()) {
            res.status(403).json({ message: 'Not authorized to delete this deck' });
            return;
        }

        // Cascading delete might be handled by DB, but safe to delete entries first if not
        await DeckEntry.destroy({ where: { decklist_id: deck.decklist_id } });
        await deck.destroy();

        res.json({ message: 'Deck removed' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
