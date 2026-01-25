const express = require('express');
const router = express.Router();
const openAiController = require('../controllers/openAiController');

router.get('/summaryTextFile',(req, res) => openAiController.summaryTextFile(req, res));
router.get('/speechToText',(req, res) => openAiController.speechToText(req, res));

module.exports = router;