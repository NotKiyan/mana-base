import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['login', 'search', 'deck_save', 'deck_delete'],
        required: true
    },
    payload: {
        type: mongoose.Schema.Types.Mixed,  // Flexible: { query: '...' } or { ip: '...', device: '...' }
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Auto-expire logs older than 90 days
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema, 'MANAactivity');
export default ActivityLog;
