const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/auth');
const User = require('../models/User');

router.get('/', isAdmin, (req, res) => {
    res.sendFile('admin.html', { root: './public' });
});

// API endpoints for admin dashboard
router.get('/api/users', isAdmin, async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/api/users/authorize', isAdmin, async (req, res) => {
    try {
        const { userId, days } = req.body;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        user.isAuthorized = true;
        
        if (days && days > 0) {
            const expires = new Date();
            expires.setDate(expires.getDate() + parseInt(days));
            user.authorizationExpires = expires;
        } else {
            user.authorizationExpires = null;
        }
        
        await user.save();
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/api/users/unauthorize', isAdmin, async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        user.isAuthorized = false;
        user.authorizationExpires = null;
        await user.save();
        
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/api/users/blacklist', isAdmin, async (req, res) => {
    try {
        const { userId, reason } = req.body;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        user.isBlacklisted = true;
        user.blacklistReason = reason;
        user.isAuthorized = false;
        await user.save();
        
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/api/users/unblacklist', isAdmin, async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        user.isBlacklisted = false;
        user.blacklistReason = '';
        await user.save();
        
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/api/users/update-roblox', isAdmin, async (req, res) => {
    try {
        const { userId, robloxUsername } = req.body;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        user.robloxUsername = robloxUsername;
        await user.save();
        
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/api/users/blacklist-roblox', isAdmin, async (req, res) => {
    try {
        const { robloxUsername, reason } = req.body;
        
        // Find all users with this Roblox username and blacklist them
        const result = await User.updateMany(
            { robloxUsername: robloxUsername },
            {
                isBlacklisted: true,
                blacklistReason: reason,
                isAuthorized: false
            }
        );
        
        res.json({ success: true, modified: result.modifiedCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
