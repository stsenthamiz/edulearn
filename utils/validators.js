const Joi = require('joi');

exports.signupSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(100).required(),
    role: Joi.string().valid('ADMIN', 'TUTOR', 'STUDENT').required()
});

exports.loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

exports.presignedRequestSchema = Joi.object({
    fileName: Joi.string().required(),
    contentType: Joi.string().valid('video/mp4', 'video/webm', 'video/ogg', 'image/jpeg', 'image/png').required()
});

exports.videoSchema = Joi.object({
    title: Joi.string().min(3).max(150).required(),
    description: Joi.string().allow('', null),
    subject_id: Joi.string().uuid().allow('', null),
    subject: Joi.string().max(100).allow('', null),
    cloudinary_url: Joi.string().uri().allow('', null),
    video_url: Joi.string().uri().allow('', null),
    thumbnail_url: Joi.string().uri().allow('', null)
});

exports.classSchema = Joi.object({
    title: Joi.string().min(3).max(150).required(),
    scheduled_time: Joi.date().iso().required(),
    meeting_link: Joi.string().uri().required(),
    subject_id: Joi.string().uuid().required(),
});
