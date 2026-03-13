const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Quiz = sequelize.define('Quiz', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    question: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    options: {
        type: DataTypes.JSON, // Assuming array of strings
        allowNull: false,
    },
    correct_answer: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    // Foreign Keys: video_id
});

module.exports = Quiz;
