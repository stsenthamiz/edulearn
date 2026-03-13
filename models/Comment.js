const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Comment = sequelize.define('Comment', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    // Foreign Keys: user_id (FK), video_id (FK)
});

module.exports = Comment;
