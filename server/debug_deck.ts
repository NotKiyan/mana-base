import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Deck from './src/models/deck.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || '');
    } catch (error: any) {
        process.exit(1);
    }
};

async function check() {
    await connectDB();
    mongoose.set('debug', true);

    const deck = await Deck.findOne().sort({ updatedAt: -1 });
    if (!deck) {
        console.log("No decks found.");
        process.exit(0);
    }

    console.log("OLD DECK:", JSON.stringify(deck.cards[0], null, 2));

    // Try to update the first card with mana_cost
    console.log("UPDATING...");
    deck.cards[0].mana_cost = "{1}{W}{U}";
    deck.cards[0].cmc = 3;
    deck.markModified('cards');

    await deck.save();

    const reloaded = await Deck.findById(deck._id);
    console.log("RELOADED DECK:", JSON.stringify(reloaded?.cards[0], null, 2));

    process.exit(0);
}

check();
