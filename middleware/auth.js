const jwt = require('jsonwebtoken');

exports.requireAuth = (req, res, next) => {
    try {
        console.log('DEBUG: requireAuth middleware triggered');
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.error('DEBUG: Missing Authorization header');
            return res.status(401).json({ status: 'fail', message: 'Authorization header missing' });
        }
        if (!authHeader.startsWith('Bearer ')) {
            console.error('DEBUG: Authorization header does not start with Bearer');
            return res.status(401).json({ status: 'fail', message: 'Invalid Authorization format' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            console.error('DEBUG: No token found after Bearer');
            return res.status(401).json({ status: 'fail', message: 'Token missing' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('DEBUG: Token decoded successfully', decoded);
        req.user = decoded; // Contains id, role, approved
        next();
    } catch (error) {
        console.error('DEBUG: JWT verification failed', error);
        return res.status(401).json({ status: 'fail', message: 'Invalid or expired token', error: error.message });
    }
};

exports.requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ status: 'fail', message: 'Forbidden. You do not have permission to perform this action' });
        }

        // Check approval for tutors performing tutor actions
        if (req.user.role === 'TUTOR' && !req.user.approved) {
            return res.status(403).json({ status: 'fail', message: 'Forbidden. Your tutor account is pending admin approval' });
        }

        next();
    };
};
