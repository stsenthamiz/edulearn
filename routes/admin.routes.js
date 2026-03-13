const express = require('express');
const { getPendingTutors, approveTutor, deleteVideo, getAllSubjects, createSubject, updateSubject, deleteSubject } = require('../controllers/adminController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.use(requireRole('ADMIN')); // Only Admins can access these routes

router.get('/tutors/pending', getPendingTutors);
router.put('/tutors/approve/:id', approveTutor);
router.delete('/video/:id', deleteVideo);

// Subject Management
router.get('/subjects', getAllSubjects);
router.post('/subjects', createSubject);
router.put('/subjects/:id', updateSubject);
router.delete('/subjects/:id', deleteSubject);

module.exports = router;
