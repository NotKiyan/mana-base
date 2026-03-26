import type { Response } from 'express';
import type { AuthRequest } from '../middleware/authMiddleware.js';
import User from '../models/user.js';
import Notification from '../models/notification.js';
import ActivityLog from '../models/activityLog.js';

// ─── Preferences ─────────────────────────────────────────────────────────────

// @desc    Get user preferences
// @route   GET /api/user/preferences
// @access  Private
export const getPreferences = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user._id).select('preferences');
        if (!user) { res.status(404).json({ message: 'User not found' }); return; }
        res.json(user.preferences || {});
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user preferences
// @route   PUT /api/user/preferences
// @access  Private
export const updatePreferences = async (req: AuthRequest, res: Response) => {
    try {
        const { theme, defaultFormat, cardDisplayMode } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    'preferences.theme': theme,
                    'preferences.defaultFormat': defaultFormat,
                    'preferences.cardDisplayMode': cardDisplayMode,
                }
            },
            { new: true, select: 'preferences' }
        );
        res.json(user?.preferences);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// ─── Recently Viewed ─────────────────────────────────────────────────────────

// @desc    Track a viewed card (capped at 20)
// @route   POST /api/user/viewed/:cardId
// @access  Private
export const trackViewed = async (req: AuthRequest, res: Response) => {
    try {
        const { cardId } = req.params;
        const { name } = req.body;

        // Remove existing entry for this card first to avoid duplicates, then push to front
        await User.findByIdAndUpdate(req.user._id, {
            $pull: { recentlyViewed: { card_id: cardId } }
        });

        await User.findByIdAndUpdate(req.user._id, {
            $push: {
                recentlyViewed: {
                    $each: [{ card_id: cardId, name, viewedAt: new Date() }],
                    $position: 0,   // push to front
                    $slice: 20      // keep only top 20
                }
            }
        });

        res.json({ ok: true });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get recently viewed cards
// @route   GET /api/user/viewed
// @access  Private
export const getRecentlyViewed = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user._id).select('recentlyViewed');
        res.json(user?.recentlyViewed || []);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// ─── Notifications ────────────────────────────────────────────────────────────

// @desc    Get all notifications for user
// @route   GET /api/user/notifications
// @access  Private
export const getNotifications = async (req: AuthRequest, res: Response) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);
        const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });
        res.json({ notifications, unreadCount });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark a notification as read
// @route   PUT /api/user/notifications/:id/read
// @access  Private
export const markNotificationRead = async (req: AuthRequest, res: Response) => {
    try {
        await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { isRead: true }
        );
        res.json({ ok: true });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark ALL notifications as read
// @route   PUT /api/user/notifications/read-all
// @access  Private
export const markAllRead = async (req: AuthRequest, res: Response) => {
    try {
        await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
        res.json({ ok: true });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// ─── Activity Log ─────────────────────────────────────────────────────────────

// @desc    Get recent activity for user
// @route   GET /api/user/activity
// @access  Private
export const getActivity = async (req: AuthRequest, res: Response) => {
    try {
        const logs = await ActivityLog.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(100);
        res.json(logs);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// ─── Search Preferences ───────────────────────────────────────────────────────

// @desc    Update search preferences
// @route   PUT /api/user/search-preferences
// @access  Private
export const updateSearchPreferences = async (req: AuthRequest, res: Response) => {
    try {
        const { defaultColors, defaultRarity, resultsPerPage, showFoilOnly, preferredLanguage } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    'preferences.searchPreferences.defaultColors': defaultColors ?? [],
                    'preferences.searchPreferences.defaultRarity': defaultRarity ?? '',
                    'preferences.searchPreferences.resultsPerPage': resultsPerPage ?? 20,
                    'preferences.searchPreferences.showFoilOnly': showFoilOnly ?? false,
                    'preferences.searchPreferences.preferredLanguage': preferredLanguage ?? 'en',
                }
            },
            { new: true, select: 'preferences.searchPreferences' }
        );
        res.json(user?.preferences);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// ─── Email & Security ─────────────────────────────────────────────────────────

import bcrypt from 'bcrypt';

// @desc    Change email (password required)
// @route   PUT /api/user/email
// @access  Private
export const changeEmail = async (req: AuthRequest, res: Response) => {
    try {
        const { newEmail, password } = req.body;
        if (!newEmail || !password) {
            res.status(400).json({ message: 'Email and current password required' }); return;
        }
        const user = await User.findById(req.user._id);
        if (!user) { res.status(404).json({ message: 'User not found' }); return; }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) { res.status(401).json({ message: 'Incorrect password' }); return; }

        const taken = await User.findOne({ email: newEmail });
        if (taken) { res.status(400).json({ message: 'Email already in use' }); return; }

        user.email = newEmail;
        await user.save();
        res.json({ message: 'Email updated successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Change password
// @route   PUT /api/user/password
// @access  Private
export const changePassword = async (req: AuthRequest, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            res.status(400).json({ message: 'Both current and new password required' }); return;
        }
        if (newPassword.length < 6) {
            res.status(400).json({ message: 'New password must be at least 6 characters' }); return;
        }
        const user = await User.findById(req.user._id);
        if (!user) { res.status(404).json({ message: 'User not found' }); return; }

        const valid = await bcrypt.compare(currentPassword, user.password);
        if (!valid) { res.status(401).json({ message: 'Current password is incorrect' }); return; }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.json({ message: 'Password changed successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
