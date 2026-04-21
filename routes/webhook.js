const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

router.post('/', webhookController.handleIncomingMessage);

module.exports = router;
