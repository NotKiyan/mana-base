import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Deck from './src/models/deck.js';
import pg from 'pg';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || '');
        console.log('MongoDB Connected');
    }
    catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};
const pgClient = new pg.Pool({
    connectionString: "postgresql://mtg:mtg@localhost:5432/mana_nexus"
});
async function migrate() {
    await connectDB();
    const decks = await Deck.find();
    console.log(`Found ${decks.length} decks to migrate.`);
    for (const deck of decks) {
        console.log(`Migrating deck: ${deck.name}`);
        let updated = false;
        for (const card of deck.cards) {
            // Fetch mana_cost and cmc from Postgres if missing
            if (!card.mana_cost || card.cmc === 0) {
                try {
                    const res = await pgClient.query('SELECT mana_cost, cmc FROM card_face WHERE card_id = $1 OR name = $2 LIMIT 1', [card.card_id, card.name]);
                    if (res.rows.length > 0) {
                        card.mana_cost = res.rows[0].mana_cost || '';
                        card.cmc = Math.floor(parseFloat(res.rows[0].cmc)) || 0;
                        updated = true;
                    }
                }
                catch (e) {
                    // fall back to name search
                }
            }
        }
        if (updated) {
            deck.markModified('cards');
            await deck.save();
            console.log(`  - Updated deck: ${deck.name}`);
        }
    }
    console.log('Migration complete!');
    process.exit(0);
}
migrate();
//# sourceMappingURL=migrate_decks.js.map