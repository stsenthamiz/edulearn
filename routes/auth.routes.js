const express = require('express');
const { signup, login, getMe } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { signupSchema, loginSchema } = require('../utils/validators');

const router = express.Router();

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.get('/me', requireAuth, getMe);

module.exports = router;
