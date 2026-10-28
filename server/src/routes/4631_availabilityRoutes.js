const express = require('express');
const router = express.Router();
const {
  getDoctorAvailability,
  setWeeklyAvailability,
  triggerSlotGeneration,
  addLeaveDate
} = require('../controllers/4631_availabilityController');
const { authenticate } = require('../middlewares/4631_auth');

// Public route to view a doctor's weekly rules
router.get('/:doctorId', getDoctorAvailability);

// Doctor or Admin protected routes
router.post('/:doctorId', authenticate, setWeeklyAvailability);
router.post('/:doctorId/generate-slots', authenticate, triggerSlotGeneration);
router.post('/:doctorId/leave', authenticate, addLeaveDate);

module.exports = router;
