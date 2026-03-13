const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Badge = sequelize.define('Badge', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.ENUM('Gold', 'Silver', 'Bronze', 'Rising Star'),
        allowNull: false,
    },
    points_required: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    icon_url: {
        type: DataTypes.STRING,
        allowNull: true,
    }
});

module.exports = Badge;
