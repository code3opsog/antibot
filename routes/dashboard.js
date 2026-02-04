const express = require('express');
const router = express.Router();
const { isAuthorized } = require('../middleware/auth');

router.get('/', isAuthorized, (req, res) => {
    res.sendFile('dashboard.html', { root: './public' });
});

module.exports = router;
