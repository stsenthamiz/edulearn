const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_URL, {
    dialect: 'postgres',
    logging: false, // Set to console.log to see SQL queries
    define: {
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('PostgreSQL Database connected successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };
