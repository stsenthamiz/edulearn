require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const compression = require('compression');
const logger = require('./utils/logger'); // Import our new winston logger
const { sequelize } = require('./models'); // Import sequelize instance (loads all models + associations)

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
    origin: '*', // In production, replace with specific origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Data Sanitization against XSS


// Performance Middleware
app.use(compression()); // GZIP compression

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again in 15 minutes!'
});
app.use('/api', limiter);

// Regular Middleware
app.use(express.json({ limit: '100mb' })); // Body parser reading data from body into req.body
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Use morgan for HTTP request logging, pipelined into winston
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Basic Health Check Route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'EduLearn API is running' });
});

// Import Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/tutor', require('./routes/tutor.routes'));
app.use('/api/student', require('./routes/student.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/leaderboard', require('./routes/leaderboard.routes'));
app.use('/api/videos', require('./routes/video.routes')); // Cloudinary video upload & search

// Global Error Handler
app.use((err, req, res, next) => {
    logger.error(err);

    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Sync all Sequelize models to the database (creates tables if they don't exist)
        await sequelize.sync({ alter: true });
        logger.info('Database synced successfully — all tables are ready.');

        app.listen(PORT, () => {
            logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
