const express = require('express');
const router = express.Router();


const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: '1234' 
};

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        // Tag the session as Admin
        req.session.isAdmin = true;
        req.session.user = { username: 'admin', role: 'admin' };
        
        return res.json({ status: 'ok', message: 'Admin login successful' });
    }

    res.status(401).json({ status: 'fail', message: 'Invalid admin credentials' });
});

router.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ status: 'ok' });
});

module.exports = router;