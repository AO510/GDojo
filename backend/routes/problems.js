const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');

// Endpoint to fetch problems by category
router.get('/:category', problemController.getProblemsByCategory);

module.exports = router;
