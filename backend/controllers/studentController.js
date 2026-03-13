const { Video, Subject, Comment, Quiz, StudentProgress, User } = require('../models');
const { setCache } = require('../services/cacheService');
const videoController = require('./videoController');

exports.getSubjects = async (req, res, next) => {
    try {
        const subjects = await Subject.findAll();

        // Save to cache for 1 hour if it bypassed the middleware
        if (req.cacheKey) {
            await setCache(req.cacheKey, subjects, 3600);
        }

        res.status(200).json({ status: 'success', source: 'db', data: subjects });
    } catch (error) {
        next(error);
    }
};

exports.getVideosBySubject = async (req, res, next) => {
    try {
        const { subjectId } = req.params;
        const videos = await Video.findAll({
            where: { subject_id: subjectId },
            attributes: ['id', 'title', 'thumbnail_url', 'cloudinary_url', 'video_url', 'views_count', 'rating_avg', 'subject'],
            include: [{ model: User, as: 'tutor', attributes: ['name'] }]
        });

        const formattedVideos = videos.map(v => {
            const data = v.toJSON();
            data.videoUrl = data.cloudinary_url || data.video_url;
            return data;
        });

        res.status(200).json({ status: 'success', data: formattedVideos });
    } catch (error) {
        next(error);
    }
};

exports.likeVideo = async (req, res, next) => {
    try {
        const { id } = req.params;
        const video = await Video.findByPk(id);

        if (!video) return res.status(404).json({ status: 'fail', message: 'Video not found' });

        // In a full implementation we'd check a UserLikes table to prevent infinite likes 
        // Here we increment the counter directly for simplicity
        video.likes_count += 1;
        await video.save();

        res.status(200).json({ status: 'success', message: 'Video liked' });
    } catch (error) {
        next(error);
    }
};

exports.commentOnVideo = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { comment } = req.body;

        const newComment = await Comment.create({
            video_id: id,
            user_id: req.user.id,
            comment
        });

        res.status(201).json({ status: 'success', data: newComment });
    } catch (error) {
        next(error);
    }
};

exports.submitQuiz = async (req, res, next) => {
    try {
        const { video_id } = req.params;
        const { score } = req.body; // Score derived from frontend logic comparison

        let progress = await StudentProgress.findOne({ where: { student_id: req.user.id, video_id } });

        if (!progress) {
            progress = await StudentProgress.create({
                student_id: req.user.id,
                video_id,
                completed: true,
                score
            });
        } else {
            progress.score = score;
            progress.completed = true;
            await progress.save();
        }

        res.status(200).json({ status: 'success', data: progress });
    } catch (error) {
        next(error);
    }
};

exports.getStudentProgress = async (req, res, next) => {
    try {
        const progress = await StudentProgress.findAll({
            where: { student_id: req.user.id }
        });

        res.status(200).json({ status: 'success', data: progress });
    } catch (error) {
        next(error);
    }
};

exports.trackVideoView = async (req, res, next) => {
    try {
        const { id } = req.params;
        const video = await Video.findByPk(id);

        if (!video) return res.status(404).json({ status: 'fail', message: 'Video not found' });

        // Secure views against spam. In production, use Redis to store IP+VideoID with 24hr TTL.
        video.views_count += 1;
        await video.save();

        res.status(200).json({ status: 'success', message: 'View recorded successfully' });
    } catch (error) {
        next(error);
    }
};

exports.getAllVideos = async (req, res, next) => {
    return videoController.getAllVideos(req, res, next);
};

exports.searchVideos = async (req, res, next) => {
    return videoController.searchVideos(req, res, next);
};

exports.getVideoById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const video = await Video.findByPk(id, {
            include: [
                { model: User, as: 'tutor', attributes: ['name'] },
                { model: Subject, as: 'subject_data', attributes: ['name'] },
                { model: Comment, as: 'comments', include: [{ model: User, as: 'author', attributes: ['name'] }] }
            ]
        });
        if (!video) return res.status(404).json({ status: 'fail', message: 'Video not found' });

        const data = video.toJSON();
        data.videoUrl = data.cloudinary_url || data.video_url;

        res.status(200).json({ status: 'success', data: data });
    } catch (error) {
        next(error);
    }
}
