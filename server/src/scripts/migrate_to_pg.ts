import mongoose from 'mongoose';
import sequelize from '../models/index.js';
import User from '../models/user.js';
import Deck from '../models/deck.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function migrate() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || '');
        console.log('MongoDB Connected');

        // Connect to PostgreSQL
        await sequelize.authenticate();
        console.log('PostgreSQL Connected');

        const mongoToPgUserMap = new Map<string, number>();

        // 1. Migrate Users
        const mongoUsers = await User.find();
        console.log(`Found ${mongoUsers.length} users in MongoDB.`);

        for (const mUser of mongoUsers) {
            console.log(`Migrating user: ${mUser.username}`);
            const [pgUser]: any = await sequelize.query(`
                INSERT INTO "player" (name, username, email, password_hash, role)
                VALUES (:name, :username, :email, :password, :role)
                ON CONFLICT (email) DO UPDATE SET 
                    username = EXCLUDED.username,
                    password_hash = EXCLUDED.password_hash
                RETURNING player_id
            `, {
                replacements: {
                    name: mUser.displayName || mUser.username,
                    username: mUser.username,
                    email: mUser.email,
                    password: mUser.password,
                    role: mUser.role || 'user'
                },
                type: (sequelize as any).QueryTypes.INSERT
            });

            mongoToPgUserMap.set(mUser._id.toString(), pgUser[0].player_id);
        }

        // 2. Migrate Decks
        const mongoDecks = await Deck.find();
        console.log(`Found ${mongoDecks.length} decks in MongoDB.`);

        for (const mDeck of mongoDecks) {
            const pgUserId = mongoToPgUserMap.get(mDeck.userId.toString());
            if (!pgUserId) {
                console.warn(`Skipping deck ${mDeck.name}: User ${mDeck.userId} not found in Postgres map.`);
                continue;
            }

            console.log(`Migrating deck: ${mDeck.name} for user ${mDeck.userId}`);
            const [pgDeck]: any = await sequelize.query(`
                INSERT INTO "decklist" (user_id, deck_name, is_public)
                VALUES (:userId, :deckName, :isPublic)
                RETURNING decklist_id
            `, {
                replacements: {
                    userId: pgUserId,
                    deckName: mDeck.name,
                    isPublic: mDeck.isPublic || false
                },
                type: (sequelize as any).QueryTypes.INSERT
            });

            const decklistId = pgDeck[0].decklist_id;

            // 3. Migrate Deck Cards
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
                    type: (sequelize as any).QueryTypes.INSERT
                });
            }
        }

        console.log('Migration successfully completed!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
