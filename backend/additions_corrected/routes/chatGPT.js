const express = require('express');
const router = express.Router();
const chatGPTController = require('../controllers/chatGPTController');

router.post('/conversationgpt4', chatGPTController.handleChat);

module.exports = router;
