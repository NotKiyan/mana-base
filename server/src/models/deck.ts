import mongoose from 'mongoose';

const deckCardSchema = new mongoose.Schema({
    card_id: {
        type: String, // UUID from PostgreSQL
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    mana_cost: {
        type: String,
        default: '',
    },
    cmc: {
        type: Number,
        default: 0,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
    },
    column: {
        type: String,
        enum: ['main', 'side'],
        default: 'main',
    },
}, { _id: false });

const deckSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
        default: 'New Deck',
    },
    description: {
        type: String,
        trim: true,
        default: '',
    },
    format: {
        type: String,
        enum: ['Standard', 'Pioneer', 'Modern', 'Legacy', 'Vintage', 'Commander', 'Pauper', 'Draft', 'Sealed', 'Other'],
        default: 'Other',
    },
    cards: [deckCardSchema],
    isPublic: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
});

// Index for fast user-based queries
deckSchema.index({ userId: 1, updatedAt: -1 });

const Deck = mongoose.model('Deck', deckSchema, 'MANAdecks');
export default Deck;
