// const express = require('express');
// const multer = require('multer');
// const { uploadVideo, getAllVideos, searchVideos } = require('../controllers/videoController');
// const { requireAuth, requireRole } = require('../middleware/auth');

// const router = express.Router();

// // Multer config — store in memory (buffer), max 500 MB
// const storage = multer.memoryStorage();
// const upload = multer({
//     storage,
//     limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
//     fileFilter: (req, file, cb) => {
//         const allowed = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-m4v'];
//         if (allowed.includes(file.mimetype)) {
//             cb(null, true);
//         } else {
//             cb(new Error(`Invalid file type "${file.mimetype}". Only video files are accepted.`), false);
//         }
//     }
// });

// // Search must be declared BEFORE /:id-style routes if any were added
// router.get('/search', searchVideos);

// // All videos — public
// router.get('/', getAllVideos);

// // Upload — TUTOR only
// router.post(
//     '/upload',
//     requireAuth,
//     requireRole('TUTOR'),
//     (req, res, next) => {
//         upload.single('video')(req, res, (err) => {
//             if (err instanceof multer.MulterError) {
//                 return res.status(400).json({ status: 'fail', message: `Upload error: ${err.message}` });
//             } else if (err) {
//                 return res.status(400).json({ status: 'fail', message: err.message });
//             }
//             next();
//         });
//     },
//     uploadVideo
// );

// module.exports = router;

const express = require('express');
const multer = require('multer');
const { uploadVideo, getAllVideos, searchVideos } = require('../controllers/videoController');

const router = express.Router();

const os = require('os');

// Multer config — store on disk temporarily to prevent memory overflow, max 100 MB
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
    fileFilter: (req, file, cb) => {
        const allowed = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-m4v'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type "${file.mimetype}". Only video files are accepted.`), false);
        }
    }
});

// Search must be declared BEFORE /:id-style routes if any were added
router.get('/search', searchVideos);

// All videos — public
router.get('/', getAllVideos);

// Upload — TUTOR only, using single("video")
const { requireAuth, requireRole } = require('../middleware/auth');
router.post('/upload', requireAuth, requireRole('TUTOR'), upload.single('video'), uploadVideo);

module.exports = router;