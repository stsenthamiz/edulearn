const { sequelize } = require('../config/database');

const User = require('./User');
const Subject = require('./Subject');
const Video = require('./Video');
const Comment = require('./Comment');
const LiveClass = require('./LiveClass');
const Quiz = require('./Quiz');
const StudentProgress = require('./StudentProgress');
const Badge = require('./Badge');
const Leaderboard = require('./Leaderboard');

// Associations

// User (Tutor) - Video (1:N)
User.hasMany(Video, { foreignKey: 'tutor_id', as: 'videos' });
Video.belongsTo(User, { foreignKey: 'tutor_id', as: 'tutor' });

// Subject - Video (1:N)
Subject.hasMany(Video, { foreignKey: 'subject_id', as: 'videos' });
Video.belongsTo(Subject, { foreignKey: 'subject_id', as: 'subject_data' }); // alias avoids collision with plain-text `subject` column

// User (Any) - Comment (1:N)
User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

// Video - Comment (1:N)
Video.hasMany(Comment, { foreignKey: 'video_id', as: 'comments' });
Comment.belongsTo(Video, { foreignKey: 'video_id', as: 'video' });

// User (Tutor) - LiveClass (1:N)
User.hasMany(LiveClass, { foreignKey: 'tutor_id', as: 'live_classes' });
LiveClass.belongsTo(User, { foreignKey: 'tutor_id', as: 'tutor' });

// Subject - LiveClass (1:N)
Subject.hasMany(LiveClass, { foreignKey: 'subject_id', as: 'live_classes' });
LiveClass.belongsTo(Subject, { foreignKey: 'subject_id', as: 'subject' });

// Video - Quiz (1:N)
Video.hasMany(Quiz, { foreignKey: 'video_id', as: 'quizzes' });
Quiz.belongsTo(Video, { foreignKey: 'video_id', as: 'video' });

// User (Student) - StudentProgress (1:N)
User.hasMany(StudentProgress, { foreignKey: 'student_id', as: 'progress' });
StudentProgress.belongsTo(User, { foreignKey: 'student_id', as: 'student' });

// Video - StudentProgress (1:N)
Video.hasMany(StudentProgress, { foreignKey: 'video_id', as: 'student_progress' });
StudentProgress.belongsTo(Video, { foreignKey: 'video_id', as: 'video' });

// User (Tutor) - Leaderboard (1:1)
User.hasOne(Leaderboard, { foreignKey: 'tutor_id', as: 'ranking' });
Leaderboard.belongsTo(User, { foreignKey: 'tutor_id', as: 'tutor' });

// User (Tutor) - Badge (N:M) Custom junction table for Tutor Badges
User.belongsToMany(Badge, { through: 'UserBadges', as: 'badges', foreignKey: 'user_id' });
Badge.belongsToMany(User, { through: 'UserBadges', as: 'tutors', foreignKey: 'badge_id' });

module.exports = {
    sequelize,
    User,
    Subject,
    Video,
    Comment,
    LiveClass,
    Quiz,
    StudentProgress,
    Badge,
    Leaderboard
};
