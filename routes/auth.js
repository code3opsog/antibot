const express = require('express');
const router = express.Router();
const passport = require('passport');
const requestIp = require('request-ip');
const useragent = require('useragent');
const User = require('../models/User');

// Discord OAuth login
router.get('/discord', passport.authenticate('discord'));

// Discord OAuth callback
router.get('/discord/callback', 
    passport.authenticate('discord', { failureRedirect: '/' }),
    async (req, res) => {
        try {
            const user = await User.findById(req.user.id);
            
            // Record login info
            user.loginHistory.push({
                ip: requestIp.getClientIp(req),
                userAgent: useragent.parse(req.headers['user-agent']).toString(),
                cookies: req.cookies
            });
            
            // Keep only last 50 logins
            if (user.loginHistory.length > 50) {
                user.loginHistory = user.loginHistory.slice(-50);
            }
            
            await user.save();
            
            // Check authorization
            if (!user.isAuthorized || user.isBlacklisted || user.isBot()) {
                return res.redirect('/unauthorized');
            }
            
            // Check authorization expiration
            if (user.authorizationExpires && user.authorizationExpires < new Date()) {
                user.isAuthorized = false;
                await user.save();
                return res.redirect('/unauthorized');
            }
            
            res.redirect('/dashboard');
        } catch (err) {
            console.error(err);
            res.redirect('/unauthorized');
        }
    }
);

// Logout
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

module.exports = router;
