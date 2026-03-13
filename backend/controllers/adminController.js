const { User, Video, Subject } = require('../models');

exports.getPendingTutors = async (req, res, next) => {
    try {
        const pendingTutors = await User.findAll({
            where: {
                role: 'TUTOR',
                approved: false
            },
            attributes: ['id', 'name', 'email', 'created_at']
        });

        res.status(200).json({
            status: 'success',
            data: pendingTutors
        });
    } catch (error) {
        next(error);
    }
};

exports.approveTutor = async (req, res, next) => {
    try {
        const { id } = req.params;

        const tutor = await User.findByPk(id);
        if (!tutor || tutor.role !== 'TUTOR') {
            return res.status(404).json({ status: 'fail', message: 'Tutor not found' });
        }

        tutor.approved = true;
        await tutor.save();

        res.status(200).json({
            status: 'success',
            message: 'Tutor approved successfully'
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteVideo = async (req, res, next) => {
    try {
        const { id } = req.params;

        const video = await Video.findByPk(id);
        if (!video) {
            return res.status(404).json({ status: 'fail', message: 'Video not found' });
        }

        // In a real app we would also delete from AWS S3 here.

        await video.destroy();

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        next(error);
    }
};

// --- SUBJECT MANAGEMENT ---

exports.getAllSubjects = async (req, res, next) => {
    try {
        const subjects = await Subject.findAll({ order: [['createdAt', 'DESC']] });
        res.status(200).json({ status: 'success', data: subjects });
    } catch (error) {
        next(error);
    }
};

exports.createSubject = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ status: 'fail', message: 'Subject name is required' });

        const subject = await Subject.create({ name: name.trim(), description: description?.trim() });
        res.status(201).json({ status: 'success', data: subject });
    } catch (error) {
        next(error);
    }
};

exports.updateSubject = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const subject = await Subject.findByPk(id);
        if (!subject) return res.status(404).json({ status: 'fail', message: 'Subject not found' });

        if (name) subject.name = name.trim();
        if (description !== undefined) subject.description = description.trim();

        await subject.save();
        res.status(200).json({ status: 'success', data: subject });
    } catch (error) {
        next(error);
    }
};

exports.deleteSubject = async (req, res, next) => {
    try {
        const { id } = req.params;
        const subject = await Subject.findByPk(id);
        if (!subject) return res.status(404).json({ status: 'fail', message: 'Subject not found' });

        await subject.destroy();
        res.status(204).json({ status: 'success', data: null });
    } catch (error) {
        next(error);
    }
};
