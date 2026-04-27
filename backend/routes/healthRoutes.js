const express = require('express');
const router = express.Router();
const { getHealth, getLiveness, getReadiness } = require('../controllers/healthController');

router.get('/', getHealth);
router.get('/live', getLiveness);
router.get('/ready', getReadiness);

module.exports = router;

