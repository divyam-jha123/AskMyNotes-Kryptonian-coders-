const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const auth = require('../middleware/auth');

const router = express.Router();

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// POST /user/signup
router.post('/signup', async (req, res) => {
  try {
    console.log('[Signup] Request received');
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Username, email and password are required.' });
    }

    console.log('[Signup] Checking for existing user:', email.toLowerCase());
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res
        .status(409)
        .json({ message: 'A user with that email already exists.' });
    }

    console.log('[Signup] Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('[Signup] Creating user...');
    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    console.log('[Signup] User created:', user._id);
    return res.status(201).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    })
  } catch (err) {
    console.error('[Signup] Error:', err.stack || err.message || err);
    return res.status(500).json({ message: 'Internal server error.', details: err.message });
  }
});

// POST /user/login
router.post('/login', async (req, res) => {
  try {
    console.log('[Login] Request received');
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required.' });
    }

    console.log('[Login] Looking up user:', email.toLowerCase());
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    console.log('[Login] Comparing password...');
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    console.log('[Login] Login successful for user:', user._id);
    return res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('[Login] Error:', err.stack || err.message || err);
    return res.status(500).json({ message: 'Internal server error.', details: err.message });
  }
});

module.exports = router;
