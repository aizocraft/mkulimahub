// routes/bookingRoutes.js 
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const consultationController = require('../controllers/consultationController');

// Consultation routes
router.post('/book', auth, consultationController.bookConsultation); 
router.patch('/:consultationId/accept', auth, consultationController.acceptConsultation);
router.patch('/:consultationId/reject', auth, consultationController.rejectConsultation);
router.get('/expert/my', auth, consultationController.getExpertConsultations);
router.get('/farmer/my', auth, consultationController.getFarmerConsultations);
router.get('/farmer/pending-count', auth, consultationController.getFarmerPendingConsultationCount);
router.get('/expert/pending-count', auth, consultationController.getExpertPendingConsultationCount);
router.patch('/:consultationId/cancel', auth, consultationController.cancelConsultation);
router.patch('/:consultationId/complete', auth, consultationController.completeConsultation);
router.post('/:consultationId/review', auth, consultationController.addReview);
router.put('/:consultationId/review', auth, consultationController.editReview);

module.exports = router;