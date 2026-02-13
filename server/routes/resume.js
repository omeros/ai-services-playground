const express = require('express');
const router = express.Router();
const openAiController = require('../controllers/openAiController');

router.post('/anzlyze',(req, res) => openAiController.summaryTextFile(req, res));

module.exports = router;