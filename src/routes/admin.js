const express = require('express');
const rootDir = require('../util/path');
const router = express.Router();

router.get('/add-coop', (req, res, next) => {
    res.send('Add a cooperative <p><form action="/admin/coop" method="POST">Name <input type="text" name="Coop"/> <p><p> <button type="submit"> OK </button> </form>')
});

router.post('/coop', (req, res, next) => {
    console.log(req.body);
    res.redirect('/');
});

module.exports = router;