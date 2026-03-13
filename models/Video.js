const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Video = sequelize.define('Video', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        field: 'id',
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'title',
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'description',
    },
    // Primary video URL — stored as "video_url" in DB (underscored: true global setting)
    // We expose it as "videoUrl" in JS but it maps to video_url column
    videoUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'video_url',          // ← the ACTUAL DB column name
    },
    // Cloudinary public_id used for deletion / management
    cloudinary_public_id: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'cloudinary_public_id',
    },
    // Plain-text subject name saved alongside the subject_id FK
    subject: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'subject',
    },
    thumbnail_url: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'thumbnail_url',
    },
    views_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'views_count',
    },
    likes_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'likes_count',
    },
    rating_avg: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0,
        field: 'rating_avg',
    },
    duration: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0,
        field: 'duration',
    },
    // Foreign Keys will be added in index.js associations (subject_id, tutor_id)
}, {
    // Keep timestamps matching the DB columns (created by underscored: true global setting)
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = Video;
