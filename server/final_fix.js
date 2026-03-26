import sequelize from './src/models/index.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Deck from './src/models/deck.js';
dotenv.config();
async function cleanupAndMigrate() {
    try {
        console.log('Cleaning up player table...');
        await sequelize.query('ALTER TABLE player DROP COLUMN IF EXISTS username');
        await sequelize.query('ALTER TABLE player DROP COLUMN IF EXISTS email');
        await sequelize.query('ALTER TABLE player DROP COLUMN IF EXISTS password_hash');
        await sequelize.query('ALTER TABLE player DROP COLUMN IF EXISTS role');
        console.log('Player table cleaned.');
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Re-migrating decks...');
        // Clear existing personal decks in Postgres (those with user_ids)
        await sequelize.query("DELETE FROM deck_entry WHERE decklist_id IN (SELECT decklist_id FROM decklist WHERE user_id IS NOT NULL)");
        await sequelize.query("DELETE FROM decklist WHERE user_id IS NOT NULL");
        const mongoDecks = await Deck.find({});
        console.log(`Found ${mongoDecks.length} decks in MongoDB.`);
        for (const mDeck of mongoDecks) {
            // 1. Insert Decklist
            const [pgDeck] = await sequelize.query(`
                INSERT INTO "decklist" (user_id, deck_name, is_public)
                VALUES (:userId, :deckName, :isPublic)
                RETURNING decklist_id
            `, {
                replacements: {
                    userId: mDeck.userId.toString(),
                    deckName: mDeck.name,
                    isPublic: mDeck.isPublic || false
                },
                type: sequelize.QueryTypes.INSERT
            });
            const decklistId = pgDeck[0].decklist_id;
            // 2. Insert Entries
            for (const mCard of mDeck.cards) {
                await sequelize.query(`
                    INSERT INTO "deck_entry" (decklist_id, card_id, quantity, is_sideboard)
                    VALUES (:decklistId, :cardId, :quantity, :isSideboard)
                `, {
                    replacements: {
                        decklistId: decklistId,
                        cardId: mCard.card_id,
                        quantity: mCard.quantity,
                        isSideboard: mCard.column === 'side'
                    },
                    type: sequelize.QueryTypes.INSERT
                });
            }
        }
        console.log('Migration complete!');
        process.exit(0);
    }
    catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}
cleanupAndMigrate();
//# sourceMappingURL=final_fix.js.map