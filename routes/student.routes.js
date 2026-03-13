const express = require('express');
const { getSubjects, getVideosBySubject, likeVideo, commentOnVideo, submitQuiz, getStudentProgress, trackVideoView, getAllVideos, getVideoById } = require('../controllers/studentController');
const { requireAuth, requireRole } = require('../middleware/auth');
const { checkCache } = require('../services/cacheService');

const router = express.Router();

// Subjects are fully public, using Redis Cache middleware
router.get('/subjects', checkCache('subjects'), getSubjects);

// All videos (recommended/home feed) — public
router.get('/videos/all', getAllVideos);

// Single video by ID
router.get('/video/:id', getVideoById);

// All roles logged in can get videos
router.get('/videos/:subjectId', requireAuth, getVideosBySubject);

// Student actions
router.post('/videos/:id/like', requireAuth, requireRole('STUDENT'), likeVideo);
router.post('/videos/:id/comment', requireAuth, requireRole('STUDENT'), commentOnVideo);
router.post('/videos/:id/view', requireAuth, requireRole('STUDENT'), trackVideoView); // New: 30s view ping
router.post('/quiz/:video_id/submit', requireAuth, requireRole('STUDENT'), submitQuiz);
router.get('/progress', requireAuth, requireRole('STUDENT'), getStudentProgress);

// Certificate Generation
router.post('/certificate', requireAuth, requireRole('STUDENT'), require('../controllers/certificateController').generateCompletionCertificate);

module.exports = router;
