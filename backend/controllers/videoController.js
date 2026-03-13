const { Op } = require('sequelize');
const { Video, User, Subject } = require('../models');
const { uploadVideoToCloudinary } = require('../services/cloudinaryService');

const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB
const VALID_MIME_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-m4v'
];

/**
 * POST /api/videos/upload
 * Accepts multipart/form-data: title, description, subject_id, subject (text), video (file)
 * Uploads to Cloudinary and saves the record in PostgreSQL.
 * Protected: TUTOR only.
 */
exports.uploadVideo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'fail', message: 'No video file was provided.' });
    }

    if (!VALID_MIME_TYPES.includes(req.file.mimetype)) {
      return res.status(400).json({
        status: 'fail',
        message: `Invalid file type "${req.file.mimetype}". Allowed: mp4, webm, ogg, mov.`
      });
    }

    if (req.file.size > MAX_FILE_SIZE_BYTES) {
      return res.status(400).json({
        status: 'fail',
        message: `File too large (${(req.file.size / (1024 * 1024)).toFixed(1)} MB). Max allowed: 500 MB.`
      });
    }

    const { title, description, subjectId, tutorId } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ status: 'fail', message: 'Video title is required.' });
    }

    const fs = require('fs');

    const cloudinary = require('cloudinary').v2;

    // Upload to Cloudinary directly
    let cloudinaryResult;
    try {
      cloudinaryResult = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "video",
        folder: "edulearn_videos"
      });
    } finally {
      // Always delete the temporary multer file
      if (req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }

    const { secure_url, public_id, duration } = cloudinaryResult;
    const thumbnail_url = secure_url.replace(/\.[^/.]+$/, '.jpg');

    // Save to database
    const video = await Video.create({
      title: title.trim(),
      description: description?.trim() || null,
      subject_id: subjectId || null,
      videoUrl: secure_url,
      cloudinary_public_id: public_id,
      duration,
      thumbnail_url,
      tutor_id: tutorId || req.user?.id,
    });

    const fullVideo = await Video.findByPk(video.id, {
      include: [
        { model: User, as: 'tutor', attributes: ['name'] },
        { model: Subject, as: 'subject_data', attributes: ['name'] },
      ]
    });

    return res.status(201).json({ status: 'success', data: fullVideo });
  } catch (error) {
    console.error('Video upload/save error:', error);
    next(error);
  }
};

/**
 * GET /api/videos
 * Returns all videos with tutor name and subject name.
 * Public.
 */
exports.getAllVideos = async (req, res, next) => {
  try {
    let videos;
    try {
      videos = await Video.findAll({
        include: [
          { model: User, as: 'tutor', attributes: ['name'] },
          { model: Subject, as: 'subject_data', attributes: ['name'] },
        ],
        order: [['createdAt', 'DESC']],
      });
    } catch (joinErr) {
      console.warn('JOIN query failed, falling back to plain query:', joinErr.message);
      // Fallback: return videos without associations so students always see content
      videos = await Video.findAll({ order: [['createdAt', 'DESC']] });
    }

    const formattedVideos = videos.map(v => {
      const data = v.toJSON();
      // Normalise the video URL — check all possible field names
      data.videoUrl = data.videoUrl || data.video_url || data.cloudinary_url || null;
      return data;
    });

    return res.status(200).json({ status: 'success', data: formattedVideos });
  } catch (error) {
    console.error('Error fetching all videos:', error);
    next(error);
  }
};

/**
 * GET /api/videos/search?q=<term>
 * Searches videos by title or description only (avoids querying potentially missing columns).
 * Public.
 */
exports.searchVideos = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) {
      return exports.getAllVideos(req, res, next);
    }

    let videos;
    try {
      videos = await Video.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.iLike]: `%${q}%` } },
            { description: { [Op.iLike]: `%${q}%` } },
          ],
        },
        include: [
          { model: User, as: 'tutor', attributes: ['name'] },
          { model: Subject, as: 'subject_data', attributes: ['name'] },
        ],
        order: [['createdAt', 'DESC']],
      });
    } catch (joinErr) {
      console.warn('Search JOIN query failed, falling back:', joinErr.message);
      videos = await Video.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.iLike]: `%${q}%` } },
            { description: { [Op.iLike]: `%${q}%` } },
          ],
        },
        order: [['createdAt', 'DESC']],
      });
    }

    const formattedVideos = videos.map(v => {
      const data = v.toJSON();
      data.videoUrl = data.videoUrl || data.video_url || data.cloudinary_url || null;
      return data;
    });

    return res.status(200).json({ status: 'success', data: formattedVideos });
  } catch (error) {
    console.error('Error searching videos:', error);
    next(error);
  }
};