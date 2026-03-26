import crypto from 'crypto';
import type { Request, Response } from 'express';
import { Card, CardFace, Edition, Set as MTGSet, CardColorIdentity, FaceType, FaceSubtype, FaceKeyword, CardLegality, CardLegalityPivot, PricePoint, Type, Subtype, Keyword } from '../models/mtg.js';
import sequelize from '../models/index.js';

import { Op, fn, col, literal } from 'sequelize';

// @desc    Advanced search for cards
// @route   GET /api/cards/advanced
export const advancedSearch = async (req: Request, res: Response) => {
    try {
        const {
            name, text, type, colors, colorMode,
            commanderColors, manaCost,
            format, formatStatus,
            set, rarity,
            stat, statMode, statValue,
            artist, flavorText,
            limit: rawLimit, offset: rawOffset
        } = req.query;

        const limit = Math.min(parseInt(rawLimit as string) || 60, 175);
        const offset = parseInt(rawOffset as string) || 0;

        // Build Card WHERE
        const cardWhere: any = {};
        if (name) {
            cardWhere.name = { [Op.iLike]: `%${name}%` };
        }

        // Build CardFace WHERE (for oracle_text, mana_cost, power, toughness)
        const faceWhere: any = {};
        if (text) {
            faceWhere.oracle_text = { [Op.iLike]: `%${text}%` };
        }
        if (manaCost) {
            faceWhere.mana_cost = manaCost as string;
        }
        if (flavorText) {
            faceWhere.flavor_text = { [Op.iLike]: `%${flavorText}%` };
        }

        // Stat filters (power, toughness, cmc)
        if (stat && statMode && statValue !== undefined && statValue !== '') {
            const statField = stat === 'pow' ? 'power' : stat === 'tou' ? 'toughness' : 'cmc';
            const opMap: Record<string, symbol> = {
                '=': Op.eq, '<': Op.lt, '>': Op.gt,
                '<=': Op.lte, '>=': Op.gte, '!=': Op.ne
            };
            const seqOp = opMap[statMode as string] || Op.eq;
            faceWhere[statField] = { [seqOp]: statValue };
        }

        // Type filter (search across Types via join)
        const faceInclude: any[] = [];
        if (type) {
            // We'll filter via a subquery on Card instead
        }

        // Build Edition WHERE
        const editionWhere: any = {};
        if (rarity) {
            const rarityMap: Record<string, string> = { c: 'common', u: 'uncommon', r: 'rare', m: 'mythic' };
            const rarities = (rarity as string).split(',').map(r => rarityMap[r] || r);
            editionWhere.rarity = { [Op.in]: rarities };
        }
        if (set) {
            const setCodes = (set as string).split(',');
            editionWhere.set_code = { [Op.in]: setCodes };
        }

        // Artist filter is on edition
        if (artist) {
            editionWhere.artist = { [Op.iLike]: `%${artist}%` };
        }

        // Color identity filter — uses a subquery approach
        let colorCardIds: string[] | null = null;
        if (colors && (colors as string).length > 0) {
            const colorList = (colors as string).split(',');
            const mode = (colorMode as string) || '=';

            if (mode === '=') {
                // Exactly these colors: card must have ALL of these and NONE others
                const allColors = ['W', 'U', 'B', 'R', 'G'];
                const excluded = allColors.filter(c => !colorList.includes(c));

                // Cards that have all requested colors
                const havingAll = await CardColorIdentity.findAll({
                    attributes: ['card_id'],
                    where: { color_id: { [Op.in]: colorList } },
                    group: ['card_id'],
                    having: literal(`COUNT(DISTINCT color_id) = ${colorList.length}`)
                });
                const haveIds = havingAll.map((r: any) => r.card_id);

                if (excluded.length > 0 && haveIds.length > 0) {
                    // Exclude cards that also have other colors
                    const excludeRows = await CardColorIdentity.findAll({
                        attributes: ['card_id'],
                        where: { card_id: { [Op.in]: haveIds }, color_id: { [Op.in]: excluded } },
                    });
                    const excludeIds = new globalThis.Set(excludeRows.map((r: any) => r.card_id));
                    colorCardIds = haveIds.filter((id: string) => !excludeIds.has(id));
                } else {
                    colorCardIds = haveIds;
                }
            } else if (mode === '>=') {
                // Including these colors (must have at least these)
                const havingAll = await CardColorIdentity.findAll({
                    attributes: ['card_id'],
                    where: { color_id: { [Op.in]: colorList } },
                    group: ['card_id'],
                    having: literal(`COUNT(DISTINCT color_id) = ${colorList.length}`)
                });
                colorCardIds = havingAll.map((r: any) => r.card_id);
            } else if (mode === '<=') {
                // At most these colors (can only have colors from this list)
                const allColors = ['W', 'U', 'B', 'R', 'G'];
                const excluded = allColors.filter(c => !colorList.includes(c));
                if (excluded.length > 0) {
                    const excludeRows = await CardColorIdentity.findAll({
                        attributes: ['card_id'],
                        where: { color_id: { [Op.in]: excluded } },
                    });
                    const excludeIds = new globalThis.Set(excludeRows.map((r: any) => r.card_id));
                    // Get all card_ids then subtract
                    const allCards = await Card.findAll({ attributes: ['card_id'], raw: true });
                    colorCardIds = allCards.map((c: any) => c.card_id).filter((id: string) => !excludeIds.has(id));
                }
            }

            if (colorCardIds !== null) {
                cardWhere.card_id = { ...(cardWhere.card_id || {}), [Op.in]: colorCardIds };
            }
        }

        // Commander color identity filter
        if (commanderColors && (commanderColors as string).length > 0) {
            const cmdColors = (commanderColors as string).split(',');
            const allColors = ['W', 'U', 'B', 'R', 'G'];
            const excluded = allColors.filter(c => !cmdColors.includes(c));
            if (excluded.length > 0) {
                const excludeRows = await CardColorIdentity.findAll({
                    attributes: ['card_id'],
                    where: { color_id: { [Op.in]: excluded } },
                });
                const excludeIds = new globalThis.Set(excludeRows.map((r: any) => r.card_id));
                const allCards = await Card.findAll({ attributes: ['card_id'], raw: true });
                const validIds = allCards.map((c: any) => c.card_id).filter((id: string) => !excludeIds.has(id));
                cardWhere.card_id = { ...(cardWhere.card_id || {}), [Op.in]: validIds };
            }
        }

        // Format legality filter
        if (format) {
            const status = (formatStatus as string) || 'legal';
            const statusMap: Record<string, number> = { legal: 0, banned: 2, restricted: 3 };
            const statusValue = statusMap[status] ?? 0;
            const formatKey = format as string;

            const legalCards = await CardLegalityPivot.findAll({
                attributes: ['card_id'],
                where: { [formatKey]: statusValue },
                raw: true
            });
            const legalIds = legalCards.map((r: any) => r.card_id);

            if (cardWhere.card_id && cardWhere.card_id[Op.in]) {
                // Intersect with existing card_id filter
                const existingIds = new globalThis.Set(cardWhere.card_id[Op.in]);
                cardWhere.card_id[Op.in] = legalIds.filter((id: string) => existingIds.has(id));
            } else {
                cardWhere.card_id = { ...(cardWhere.card_id || {}), [Op.in]: legalIds };
            }
        }

        // Type line filter — filter card names by type through face_type join
        if (type) {
            const typeStr = type as string;
            const faceIds = await CardFace.findAll({
                attributes: ['card_id'],
                where: {
                    [Op.or]: [
                        // Check if any Type matches
                        literal(`face_id IN (SELECT ft.face_id FROM face_type ft JOIN type t ON ft.type_id = t.type_id WHERE LOWER(t.type_name) LIKE LOWER('%${typeStr.replace(/'/g, "''")}%'))`)
                    ]
                },
                raw: true
            });
            const typeCardIds = [...new globalThis.Set(faceIds.map((r: any) => r.card_id))];

            if (cardWhere.card_id && cardWhere.card_id[Op.in]) {
                const existingIds = new globalThis.Set(cardWhere.card_id[Op.in]);
                cardWhere.card_id[Op.in] = typeCardIds.filter((id: string) => existingIds.has(id));
            } else {
                cardWhere.card_id = { ...(cardWhere.card_id || {}), [Op.in]: typeCardIds };
            }
        }

        // Query editions
        const editions = await Edition.findAll({
            where: Object.keys(editionWhere).length > 0 ? editionWhere : undefined,
            include: [
                {
                    model: Card,
                    where: Object.keys(cardWhere).length > 0 ? cardWhere : undefined,
                    include: [{
                        model: CardFace,
                        where: Object.keys(faceWhere).length > 0 ? faceWhere : undefined,
                    }]
                },
                { model: MTGSet, attributes: ['set_code', 'set_name', 'icon_svg_uri'] }
            ],
            limit,
            offset,
            order: [['set_code', 'ASC'], ['collector_number', 'ASC']]
        });

        res.json(editions);
    } catch (error: any) {
        console.error('Error in advancedSearch:', error);
        res.status(500).json({ message: error.message });
    }
};

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
                { model: MTGSet }
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
                { model: MTGSet }
            ],
            order: [['set_code', 'ASC'], ['collector_number', 'ASC']],
            limit: 40
        });

        // Sort so exact name matches appear first
        const lowerQuery = query.toLowerCase();
        editions.sort((a: any, b: any) => {
            const aExact = a.Card?.name?.toLowerCase() === lowerQuery ? 0 : 1;
            const bExact = b.Card?.name?.toLowerCase() === lowerQuery ? 0 : 1;
            return aExact - bExact;
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
        const card = await Card.findOne({
            where: { card_id: req.params.id as string },
            include: [
                {
                    model: CardFace,
                    include: [
                        { model: Type, through: { attributes: [] } },
                        { model: Subtype, through: { attributes: [] } },
                        { model: Keyword, through: { attributes: [] } },
                    ]
                },
                { model: CardColorIdentity },
                { model: CardLegalityPivot, as: 'legalities' },
                {
                    model: Edition,
                    include: [
                        { model: MTGSet, attributes: ['set_code', 'set_name', 'icon_svg_uri', 'release_date'] },
                        { model: PricePoint, limit: 1, order: [['date_recorded', 'DESC']] }
                    ]
                }
            ]
        });

        if (!card) {
            res.status(404).json({ message: 'Card not found' });
            return;
        }

        res.json(card);
    } catch (error: any) {
        console.error('Error in getCardById:', error);
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
            await MTGSet.upsert({
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

        // 4. Handle Faces (Delete existing and re-insert to keep order/count correct)
        if (faces && Array.isArray(faces)) {
            // Delete associated face types/subtypes/keywords first (if they exist)
            // For now, these tables are likely empty or managed by seeder, but let's be safe
            const existingFaces = await CardFace.findAll({ where: { card_id: finalCardId }, transaction });
            const existingFaceIds = existingFaces.map(f => (f as any).face_id);

            if (existingFaceIds.length > 0) {
                // Delete through-table associations (FaceType, etc.) to satisfy foreign keys
                await FaceType.destroy({ where: { face_id: { [Op.in]: existingFaceIds } }, transaction });
                await FaceSubtype.destroy({ where: { face_id: { [Op.in]: existingFaceIds } }, transaction });
                await FaceKeyword.destroy({ where: { face_id: { [Op.in]: existingFaceIds } }, transaction });
            }

            // Purge faces
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

// @desc    Delete a card and all associated data
// @route   DELETE /api/cards/:id
export const deleteCard = async (req: Request, res: Response) => {
    const transaction = await sequelize.transaction();
    try {
        const id = req.params.id as string;

        // 1. Find the card
        const card = await Card.findByPk(id);
        if (!card) {
            await transaction.rollback();
            res.status(404).json({ message: 'Card not found' });
            return;
        }

        // 2. Find associated Editions to delete PricePoints
        const editions = await Edition.findAll({ where: { card_id: id } });
        const editionIds = editions.map(e => e.dataValues.edition_id);

        if (editionIds.length > 0) {
            // Delete PricePoints
            await PricePoint.destroy({ where: { edition_id: { [Op.in]: editionIds } }, transaction });
            // Delete Editions
            await Edition.destroy({ where: { card_id: id }, transaction });
        }

        // 3. Find associated CardFaces to delete face associations
        const faces = await CardFace.findAll({ where: { card_id: id } });
        const faceIds = faces.map(f => f.dataValues.face_id);

        if (faceIds.length > 0) {
            // Delete Face Associations
            await FaceType.destroy({ where: { face_id: { [Op.in]: faceIds } }, transaction });
            await FaceSubtype.destroy({ where: { face_id: { [Op.in]: faceIds } }, transaction });
            await FaceKeyword.destroy({ where: { face_id: { [Op.in]: faceIds } }, transaction });
            // Delete CardFaces
            await CardFace.destroy({ where: { card_id: id }, transaction });
        }

        // 4. Delete direct associations
        await CardColorIdentity.destroy({ where: { card_id: id }, transaction });
        await CardLegality.destroy({ where: { card_id: id }, transaction });
        await CardLegalityPivot.destroy({ where: { card_id: id }, transaction });

        // 5. Delete the Card itself
        await Card.destroy({ where: { card_id: id }, transaction });

        await transaction.commit();
        res.json({ message: 'Card and all associated data deleted successfully' });
    } catch (error: any) {
        await transaction.rollback();
        console.error('Error in deleteCard:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get editions for a specific card
// @route   GET /api/cards/:id/editions
export const getEditionsByCardId = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const editions = await Edition.findAll({
            where: { card_id: id },
            include: [{ model: MTGSet }],
            order: [['set_code', 'ASC'], ['collector_number', 'ASC']]
        });
        res.json(editions);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new edition for a card
// @route   POST /api/cards/editions
export const createEdition = async (req: Request, res: Response) => {
    try {
        const { card_id, set_code, rarity, artist, collector_number, image_url_normal, image_url_small } = req.body;

        // Ensure set exists
        const set = await MTGSet.findByPk(set_code);
        if (!set) {
            res.status(404).json({ message: `Set ${set_code} not found. Create the set first.` });
            return;
        }

        const edition = await Edition.create({
            edition_id: crypto.randomUUID(), // Assuming we want to generate a new UUID if not provided
            card_id,
            set_code,
            rarity: rarity || 'common',
            artist: artist || 'Unknown',
            collector_number: collector_number || '0',
            image_url_normal: image_url_normal || '',
            image_url_small: image_url_small || ''
        });

        res.status(201).json(edition);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update an edition
// @route   PUT /api/cards/editions/:id
export const updateEdition = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const edition = await Edition.findByPk(id);
        if (!edition) {
            res.status(404).json({ message: 'Edition not found' });
            return;
        }

        const { rarity, artist, collector_number, image_url_normal, image_url_small } = req.body;

        await edition.update({
            rarity: rarity !== undefined ? rarity : edition.dataValues.rarity,
            artist: artist !== undefined ? artist : edition.dataValues.artist,
            collector_number: collector_number !== undefined ? collector_number : edition.dataValues.collector_number,
            image_url_normal: image_url_normal !== undefined ? image_url_normal : edition.dataValues.image_url_normal,
            image_url_small: image_url_small !== undefined ? image_url_small : edition.dataValues.image_url_small
        });

        res.json(edition);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete an edition
// @route   DELETE /api/cards/editions/:id
export const deleteEdition = async (req: Request, res: Response) => {
    console.log(`[DEBUG] Attempting to delete edition: ${req.params.id}`);
    const transaction = await sequelize.transaction();
    console.log('[DEBUG] Transaction started');
    try {
        const id = req.params.id as string;
        const edition = await Edition.findByPk(id);
        console.log(`[DEBUG] Edition found: ${!!edition}`);

        if (!edition) {
            console.log('[DEBUG] Edition not found, rolling back');
            await transaction.rollback();
            res.status(404).json({ message: 'Edition not found' });
            return;
        }

        // Delete associated price points first
        console.log('[DEBUG] Deleting price points...');
        await PricePoint.destroy({ where: { edition_id: id }, transaction });
        console.log('[DEBUG] Price points deleted');

        // Delete the edition
        console.log('[DEBUG] Deleting edition...');
        await edition.destroy({ transaction });
        console.log('[DEBUG] Edition deleted');

        await transaction.commit();
        console.log('[DEBUG] Transaction committed');
        res.json({ message: 'Edition and its prices deleted successfully' });
    } catch (error: any) {
        console.error('[DEBUG] Error during deletion:', error);
        await transaction.rollback();
        res.status(500).json({ message: error.message });
    }
};

// @desc    Bulk add editions for cards to a specific set
// @route   POST /api/cards/editions/bulk
export const bulkAddEditions = async (req: Request, res: Response) => {
    const transaction = await sequelize.transaction();
    try {
        const { set_code, card_identifiers } = req.body; // card_identifiers is an array of card_id or name

        if (!set_code || !card_identifiers || !Array.isArray(card_identifiers)) {
            res.status(400).json({ message: 'set_code and card_identifiers (array) are required' });
            return;
        }

        // Ensure set exists
        const set = await MTGSet.findByPk(set_code);
        if (!set) {
            res.status(404).json({ message: `Set ${set_code} not found.` });
            return;
        }

        const results = [];
        for (const identifier of card_identifiers) {
            // Find the card by ID or Exact Name
            const card = await Card.findOne({
                where: {
                    [Op.or]: [
                        { card_id: identifier },
                        { name: identifier }
                    ]
                }
            });

            if (card) {
                const eid = crypto.randomUUID();
                await Edition.create({
                    edition_id: eid,
                    card_id: card.dataValues.card_id,
                    set_code: set_code,
                    rarity: 'common',
                    artist: 'Unknown',
                    collector_number: '0',
                    image_url_normal: '',
                    image_url_small: ''
                }, { transaction });
                results.push({ identifier, status: 'created', edition_id: eid });
            } else {
                results.push({ identifier, status: 'card_not_found' });
            }
        }

        await transaction.commit();
        res.status(201).json({ message: 'Bulk processing complete', results });
    } catch (error: any) {
        await transaction.rollback();
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a new price record for an edition (triggers audit log automatically)
// @route   POST /api/cards/editions/price
// @access  Private (Admin)
export const upsertEditionPrice = async (req: Request, res: Response) => {
    try {
        const { edition_id, market_price_usd, foil_price_usd } = req.body;

        if (!edition_id) {
            res.status(400).json({ message: 'edition_id is required' });
            return;
        }

        const edition = await Edition.findByPk(edition_id);
        if (!edition) {
            res.status(404).json({ message: 'Edition not found' });
            return;
        }

        const pricePoint = await PricePoint.create({
            edition_id,
            date_recorded: new Date(),
            market_price_usd: market_price_usd ?? null,
            foil_price_usd: foil_price_usd ?? null,
        });

        res.status(201).json({ message: 'Price recorded successfully', pricePoint });
    } catch (error: any) {
        console.error('Error in upsertEditionPrice:', error);
        res.status(500).json({ message: error.message });
    }
};
