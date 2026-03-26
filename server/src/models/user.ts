import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    displayName: {
        type: String,
        trim: true,
        default: ''
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    preferences: {
        theme: { type: String, enum: ['dark', 'light', 'system'], default: 'system' },
        defaultFormat: { type: String, default: 'Standard' },
        cardDisplayMode: { type: String, enum: ['grid', 'list'], default: 'grid' },
        searchPreferences: {
            defaultColors: { type: [String], default: [] },
            defaultRarity: { type: String, default: '' },
            resultsPerPage: { type: Number, default: 20 },
            showFoilOnly: { type: Boolean, default: false },
            preferredLanguage: { type: String, default: 'en' },
        }
    },
    recentlyViewed: {
        type: [{
            card_id: String,
            name: String,
            viewedAt: { type: Date, default: Date.now }
        }],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema, 'MANAusers');
export default User;
