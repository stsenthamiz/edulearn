const { Video, LiveClass, Subject } = require('../models');

exports.createVideoObject = async (req, res, next) => {
    try {
        const { title, description, subject_id, subject, cloudinary_url, video_url, thumbnail_url } = req.body;
        const tutor_id = req.user.id;

        const video = await Video.create({
            title,
            description,
            subject_id: subject_id || null,
            subject: subject || null,
            tutor_id,
            cloudinary_url: cloudinary_url || null,
            video_url: video_url || null,
            thumbnail_url: thumbnail_url || null,
        });

        res.status(201).json({
            status: 'success',
            data: video
        });
    } catch (error) {
        next(error);
    }
};

exports.getTutorVideos = async (req, res, next) => {
    try {
        const videos = await Video.findAll({
            where: { tutor_id: req.user.id },
            include: [{ model: Subject, as: 'subject_data', attributes: ['name'] }]
        });

        res.status(200).json({
            status: 'success',
            data: videos
        });
    } catch (error) {
        next(error);
    }
};

exports.scheduleLiveClass = async (req, res, next) => {
    try {
        const { title, scheduled_time, meeting_link, subject_id } = req.body;

        const liveClass = await LiveClass.create({
            title,
            scheduled_time,
            meeting_link,
            subject_id,
            tutor_id: req.user.id
        });

        res.status(201).json({
            status: 'success',
            data: liveClass
        });
    } catch (error) {
        next(error);
    }
};

const { calculateTutorEngagement } = require('../services/engagementService');

exports.getTutorAnalytics = async (req, res, next) => {
    try {
        const videos = await Video.findAll({ where: { tutor_id: req.user.id } });

        const totalViews = videos.reduce((acc, curr) => acc + curr.views_count, 0);
        const totalLikes = videos.reduce((acc, curr) => acc + curr.likes_count, 0);
        const totalVideos = videos.length;

        // Advanced analytics combining everything based on formula
        const totalEngagementScore = await calculateTutorEngagement(req.user.id);

        res.status(200).json({
            status: 'success',
            data: {
                totalVideos,
                totalViews,
                totalLikes,
                totalEngagementScore
            }
        });

    } catch (error) {
        next(error);
    }
};
