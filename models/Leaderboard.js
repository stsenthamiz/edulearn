const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Leaderboard = sequelize.define('Leaderboard', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    rank: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    score: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    // tutor_id FK connects back to User
});

module.exports = Leaderboard;
