import express from 'express';
import {
    getPreferences,
    updatePreferences,
    trackViewed,
    getRecentlyViewed,
    getNotifications,
    markNotificationRead,
    markAllRead,
    getActivity,
    updateSearchPreferences,
    changeEmail,
    changePassword,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect as any);

// Preferences
router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);

// Recently Viewed
router.get('/viewed', getRecentlyViewed);
router.post('/viewed/:cardId', trackViewed);

// Notifications
router.get('/notifications', getNotifications);
router.put('/notifications/read-all', markAllRead);
router.put('/notifications/:id/read', markNotificationRead);

// Activity Log
router.get('/activity', getActivity);

// Search Preferences
router.put('/search-preferences', updateSearchPreferences);

// Email & Security
router.put('/email', changeEmail);
router.put('/password', changePassword);

export default router;
