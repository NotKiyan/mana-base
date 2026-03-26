import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Deck from './src/models/deck.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });
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
async function seed() {
    await connectDB();
    const userId = "697aeebfa7294faf3570f4a8";
    // Delete existing test decks for this user to keep it clean
    await Deck.deleteMany({ userId, name: "Tournament Mono-Red" });
    const deckData = {
        userId,
        name: "Tournament Mono-Red",
        description: "Official Standard Aggro - Verified Mana Curve",
        format: "Standard",
        isPublic: true,
        cards: [
            { card_id: "df2af646-3e5b-43a3-8f3e-50565889f456", name: "Urza, Lord Protector", quantity: 4, column: "main", mana_cost: "{1}{W}{U}", cmc: 3 },
            { card_id: "a90ee91c-b3a4-4421-8272-bc275c100ca4", name: "Monastery Swiftspear", quantity: 4, column: "main", mana_cost: "{R}", cmc: 1 },
            { card_id: "b8123456-7890-abcd-efgh-1234567890ab", name: "Kumano Faces Kakkazan", quantity: 4, column: "main", mana_cost: "{R}", cmc: 1 },
            { card_id: "c7213456-7890-abcd-efgh-1234567890ac", name: "Play with Fire", quantity: 4, column: "main", mana_cost: "{R}", cmc: 1 },
            { card_id: "d1123456-7890-abcd-efgh-1234567890ad", name: "Lightning Strike", quantity: 4, column: "main", mana_cost: "{1}{R}", cmc: 2 },
            { card_id: "e9923456-7890-abcd-efgh-1234567890ae", name: "Mishra's Foundry", quantity: 4, column: "main", mana_cost: "", cmc: 0 },
            { card_id: "f5523456-7890-abcd-efgh-1234567890af", name: "Mountain", quantity: 20, column: "main", mana_cost: "", cmc: 0 },
            { card_id: "g2223456-7890-abcd-efgh-1234567890ag", name: "Feldon, Ronom Excavator", quantity: 3, column: "main", mana_cost: "{1}{R}", cmc: 2 },
            { card_id: "h1123456-7890-abcd-efgh-1234567890ah", name: "Bloodthirsty Adversary", quantity: 4, column: "main", mana_cost: "{1}{R}", cmc: 2 },
            { card_id: "i0023456-7890-abcd-efgh-1234567890ai", name: "Chandra, Dressed to Kill", quantity: 3, column: "main", mana_cost: "{1}{R}{R}", cmc: 3 },
            { card_id: "j9923456-7890-abcd-efgh-1234567890aj", name: "Thundering Raiju", quantity: 2, column: "main", mana_cost: "{2}{R}{R}", cmc: 4 },
            // Sideboard
            { card_id: "s1123456-7890-abcd-efgh-1234567890ak", name: "Rending Flame", quantity: 4, column: "side", mana_cost: "{2}{R}", cmc: 3 },
            { card_id: "s2223456-7890-abcd-efgh-1234567890al", name: "Lithomantic Barrage", quantity: 4, column: "side", mana_cost: "{R}", cmc: 1 },
            { card_id: "s3323456-7890-abcd-efgh-1234567890am", name: "Unlicensed Hearse", quantity: 3, column: "side", mana_cost: "{2}", cmc: 2 },
            { card_id: "s4423456-7890-abcd-efgh-1234567890an", name: "Furnace Reins", quantity: 4, column: "side", mana_cost: "{2}{R}", cmc: 3 }
        ]
    };
    const newDeck = await Deck.create(deckData);
    console.log(`Deck created successfully: ${newDeck._id}`);
    process.exit(0);
}
seed();
//# sourceMappingURL=seed_deck.js.map