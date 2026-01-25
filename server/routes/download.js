const express = require('express');
const router = express.Router();
const downloadController = require('../controllers/downloadController');

router.get('/',(req, res) => downloadController.startDownload(req, res));

module.exports = router;