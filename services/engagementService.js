const { User, Video, Quiz, StudentProgress } = require('../models');

/**
 * Calculates a dynamic engagement score for a given tutor
 * Formula: engagement_score = views + (likes * 2) + (quiz_completions * 3)
 */
exports.calculateTutorEngagement = async (tutorId) => {
    const tutorVideos = await Video.findAll({ where: { tutor_id: tutorId } });

    let totalScore = 0;

    for (const video of tutorVideos) {
        const viewsScore = video.views_count;
        const likesScore = video.likes_count * 2;

        // Calculate Quiz Completions for this video
        const completions = await StudentProgress.count({
            where: { video_id: video.id, completed: true }
        });
        const quizScore = completions * 3;

        totalScore += (viewsScore + likesScore + quizScore);
    }

    return totalScore;
};
