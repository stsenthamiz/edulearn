const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LiveClass = sequelize.define('LiveClass', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    scheduled_time: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    meeting_link: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isUrl: true,
        }
    },
    // Foreign Keys: tutor_id, subject_id
});

module.exports = LiveClass;
