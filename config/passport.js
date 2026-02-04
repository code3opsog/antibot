const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_CALLBACK_URL,
    scope: ['identify', 'email']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ discordId: profile.id });
        
        if (!user) {
            user = new User({
                discordId: profile.id,
                username: profile.username,
                discriminator: profile.discriminator,
                email: profile.email,
                avatar: profile.avatar,
                joinDate: new Date(profile.createdTimestamp)
            });
            await user.save();
        } else {
            // Update user info
            user.username = profile.username;
            user.discriminator = profile.discriminator;
            user.email = profile.email;
            user.avatar = profile.avatar;
            await user.save();
        }
        
        done(null, user);
    } catch (err) {
        done(err, null);
    }
}));
