const express = require('express');
const router = express.Router();
const {
  getAvailableSlots,
  getSlotById
} = require('../controllers/4631_slotController');

// Public endpoints for viewing slots
router.get('/', getAvailableSlots);
router.get('/:id', getSlotById);

module.exports = router;
