const express = require('express');
const router = express.Router();
const speechToTextController = require('../controllers/speechToTextController');

router.get('/',(req, res) => speechToTextController.start(req, res));

module.exports = router;