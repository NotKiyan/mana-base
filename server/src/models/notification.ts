import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['system', 'deck', 'social', 'tournament'],
        default: 'system'
    },
    message: {
        type: String,
        required: true
    },
    link: {
        type: String,  // Optional URL to navigate to on click
        default: null
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Notification = mongoose.model('Notification', notificationSchema, 'MANAnotifications');
export default Notification;
