const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StudentProgress = sequelize.define('StudentProgress', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    score: {
        // E.g. points accumulated from quizzes for this specific video module
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    // Foreign Keys: student_id, video_id
});

module.exports = StudentProgress;
