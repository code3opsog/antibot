const User = require('../models/User');

module.exports = {
    isAuthenticated: (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/');
    },
    
    isAuthorized: async (req, res, next) => {
        if (!req.isAuthenticated()) {
            return res.redirect('/');
        }
        
        try {
            const user = await User.findById(req.user.id);
            
            if (!user) {
                return res.redirect('/unauthorized');
            }
            
            // Check if user is blacklisted
            if (user.isBlacklisted) {
                return res.redirect('/unauthorized');
            }
            
            // Check if user is authorized
            if (!user.isAuthorized) {
                return res.redirect('/unauthorized');
            }
            
            // Check if authorization has expired
            if (user.authorizationExpires && user.authorizationExpires < new Date()) {
                user.isAuthorized = false;
                await user.save();
                return res.redirect('/unauthorized');
            }
            
            // Check if user is a bot (based on join date)
            if (user.isBot()) {
                return res.redirect('/unauthorized');
            }
            
            next();
        } catch (err) {
            console.error(err);
            res.redirect('/unauthorized');
        }
    },
    
    isAdmin: (req, res, next) => {
        if (!req.isAuthenticated()) {
            return res.redirect('/');
        }
        
        // Check if user is admin (based on Discord ID)
        if (req.user.discordId === process.env.ADMIN_DISCORD_ID) {
            return next();
        }
        
        res.redirect('/dashboard');
    }
};
