const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    discordId: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    discriminator: String,
    email: String,
    avatar: String,
    joinDate: {
        type: Date,
        required: true
    },
    isAuthorized: {
        type: Boolean,
        default: false
    },
    authorizationExpires: Date,
    robloxUsername: String,
    isBlacklisted: {
        type: Boolean,
        default: false
    },
    blacklistReason: String,
    loginHistory: [{
        timestamp: {
            type: Date,
            default: Date.now
        },
        ip: String,
        userAgent: String,
        cookies: Object
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Method to check if user is a bot (based on join date)
userSchema.methods.isBot = function() {
    const accountAge = Date.now() - this.joinDate.getTime();
    const daysOld = accountAge / (1000 * 60 * 60 * 24);
    return daysOld < 7; // Accounts less than 7 days old are considered bots
};

module.exports = mongoose.model('User', userSchema);
