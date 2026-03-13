const express = require('express');
const { createVideoObject, getTutorVideos, scheduleLiveClass, getTutorAnalytics } = require('../controllers/tutorController');
const { requireAuth, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { videoSchema, classSchema } = require('../utils/validators');

const router = express.Router();

router.use(requireAuth);
router.use(requireRole('TUTOR'));

// POST /api/tutor/videos — save video metadata after Cloudinary upload (legacy/alternate flow)
router.post('/videos', validate(videoSchema), createVideoObject);
router.get('/videos', getTutorVideos);
router.post('/live-class/schedule', validate(classSchema), scheduleLiveClass);
router.get('/analytics', getTutorAnalytics);

module.exports = router;
