const { client } = require('../config/redis');

/**
 * Express middleware to check Redis Cache
 * @param {string} keyPrefix - Prefix for the redis key (e.g. 'subjects')
 */
exports.checkCache = (keyPrefix) => {
    return async (req, res, next) => {
        try {
            // Create a unique key based on prefix + URL/params
            const cacheKey = `${keyPrefix}:${req.originalUrl}`;
            const data = await client.get(cacheKey);

            if (data) {
                return res.status(200).json({
                    status: 'success',
                    source: 'cache',
                    data: JSON.parse(data)
                });
            }
            // Attach cacheKey to req so the controller can save the response later
            req.cacheKey = cacheKey;
            next();
        } catch (err) {
            console.error('Redis Cache Error: ', err);
            // Fallback to database query if redis fails
            next();
        }
    };
};

/**
 * Utility to save data to Redis Cache
 * @param {string} key - The exact key to save under
 * @param {any} data - Data to stringify
 * @param {number} ttl - Time to live in seconds (default 1 hr)
 */
exports.setCache = async (key, data, ttl = 3600) => {
    try {
        await client.setEx(key, ttl, JSON.stringify(data));
    } catch (err) {
        console.error('Redis Set Error: ', err);
    }
};
