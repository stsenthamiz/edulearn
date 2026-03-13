const { User, Leaderboard } = require('../models');

exports.getLeaderboard = async (req, res, next) => {
    try {
        const list = await Leaderboard.findAll({
            order: [['score', 'DESC']],
            limit: 10,
            include: [{
                model: User,
                as: 'tutor',
                attributes: ['id', 'name', 'email']
            }]
        });

        res.status(200).json({ status: 'success', source: 'db', data: list });
    } catch (error) {
        next(error);
    }
};
