const { User } = require('../models');
const jwt = require('jsonwebtoken');

const generateToken = (id, role, approved) => {
    return jwt.sign({ id, role, approved }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });
};

exports.signup = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ status: 'fail', message: 'Email already strictly in use' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role
        });

        // Don't generate token for unapproved tutors on signup (they must wait for admin)
        if (user.role === 'TUTOR' && !user.approved) {
            return res.status(201).json({
                status: 'success',
                message: 'Tutor account created successfully. Please wait for admin approval before logging in.'
            });
        }

        const token = generateToken(user.id, user.role, user.approved);

        res.status(201).json({
            status: 'success',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        });

    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user || !(await user.isValidPassword(password))) {
            return res.status(401).json({ status: 'fail', message: 'Incorrect email or password' });
        }

        if (user.role === 'TUTOR' && !user.approved) {
            return res.status(403).json({ status: 'fail', message: 'Your tutor account is pending admin approval.' });
        }

        const token = generateToken(user.id, user.role, user.approved);

        res.status(200).json({
            status: 'success',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        });

    } catch (error) {
        next(error);
    }
};

exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'name', 'email', 'role', 'approved', 'created_at']
        });

        if (!user) {
            return res.status(404).json({ status: 'fail', message: 'User not found' });
        }

        res.status(200).json({
            status: 'success',
            user
        });
    } catch (error) {
        next(error);
    }
};
