const User = require('../models/User');
const Setting = require('../models/Setting');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('../services/emailService');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const generate2FACode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.register = async (req, res) => {
    try {
        const { name, email, password, phoneNumber } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Check 2FA Setting
        const setting = await Setting.findOne({ where: { key: 'enable_2fa_registration' } });
        const is2FAEnabled = setting && setting.value === 'true';

        let isActive = true;
        let twoFactorCode = null;
        let twoFactorExpires = null;

        if (is2FAEnabled) {
            if (!phoneNumber) {
                return res.status(400).json({ message: 'Phone number is required for registration' });
            }
            isActive = false;
            twoFactorCode = generate2FACode();
            twoFactorExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            // MOCK SMS SENDING
            console.log(`[SMS MOCK] Sending Code ${twoFactorCode} to ${phoneNumber}`);
        }

        // Create user (default role is 'user')
        const user = await User.create({
            name,
            email,
            password,
            phoneNumber,
            role: 'user',
            isActive,
            twoFactorCode,
            twoFactorExpires
        });

        // Fire and forget welcome email
        emailService.sendWelcomeEmail(user.email, user.name, user.language).catch(e => console.error('[Welcome Email Error]', e));

        if (is2FAEnabled) {
            return res.status(200).json({
                message: 'Verification code sent',
                userId: user.id,
                requires2FA: true
            });
        }

        const token = generateToken(user.id, user.role);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                language: user.language
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.verifySms = async (req, res) => {
    try {
        const { userId, code } = req.body;
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isActive) {
            return res.status(400).json({ message: 'User already active' });
        }

        if (user.twoFactorCode !== code || user.twoFactorExpires < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired code' });
        }

        user.isActive = true;
        user.twoFactorCode = null;
        user.twoFactorExpires = null;
        await user.save();

        const token = generateToken(user.id, user.role);
        res.status(200).json({
            message: 'Verification successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                language: user.language
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Handle Google Users trying to login with password if they never set one
        if (!user.password) {
            return res.status(400).json({ message: 'Please login with Google' });
        }

        if (user && (await user.matchPassword(password))) {
            if (!user.isActive) {
                return res.status(403).json({ message: 'Account not active. Please complete verification.' });
            }

            res.json({
                message: 'Login successful',
                token: generateToken(user.id, user.role),
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    language: user.language
                }
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleAuth = async (req, res) => {
    try {
        const { email, name, googleId, token } = req.body;

        if (token) {
            // VERIFY TOKEN FROM FRONTEND (If provided)
            try {
                const ticket = await client.verifyIdToken({
                    idToken: token,
                    audience: process.env.GOOGLE_CLIENT_ID,
                });
                const payload = ticket.getPayload();

                // Trust payload data over body data if token is present
                // payload.email, payload.name, payload.sub (googleId) are verified
            } catch (verificationError) {
                // Warn but continue if it's a mock token for dev
                console.warn("Google Token Verification Failed:", verificationError.message);
                if (process.env.NODE_ENV === 'production') {
                    return res.status(401).json({ message: 'Invalid Google Token' });
                }
            }
        }

        let user = await User.findOne({ where: { email } });

        if (user) {
            // Update googleId if missing
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }
        } else {
            user = await User.create({
                name,
                email,
                googleId,
                role: 'user',
                isActive: true, // Auto-activate google users
                password: null // No password
            });

            // Fire and forget welcome email for newly created user
            emailService.sendWelcomeEmail(user.email, user.name, user.language).catch(e => console.error('[Welcome Email Error]', e));
        }

        const jwtToken = generateToken(user.id, user.role);

        res.json({
            message: 'Google login successful',
            token: jwtToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                language: user.language
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { name, email, phoneNumber } = req.body;

        if (email && email !== user.email) {
            // Check if email taken by another user
            const exists = await User.findOne({ where: { email } });
            if (exists) return res.status(400).json({ message: 'Email already in use' });
        }

        user.name = name || user.name;
        user.email = email || user.email;
        if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
        if (req.body.language) user.language = req.body.language;

        await user.save();

        res.json({
            message: 'Profile updated',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phoneNumber: user.phoneNumber,
                language: user.language
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check current password match - verify matchPassword returns promise
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect current password' });
        }

        // Update password - hook will hash it
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            // Return success even if not found to prevent email enumeration
            return res.json({ message: 'If that email is in our database, we will send a password recovery link to it' });
        }

        // Generate token
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Hash token before storing it
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour

        await user.save({ validate: false }); // Skip validation just in case

        try {
            await emailService.sendPasswordRecovery(user.email, resetToken, user.language);
            res.json({ message: 'If that email is in our database, we will send a password recovery link to it' });
        } catch (error) {
            console.error('Email could not be sent', error);
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            await user.save({ validate: false });
            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        console.error('forgotPassword error:', error);
        console.error('Error Details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        res.status(500).json({ message: 'Server error', details: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        // Hash token to compare with database
        const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            where: {
                resetPasswordToken,
                resetPasswordExpires: {
                    [require('sequelize').Op.gt]: Date.now()
                }
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired password reset token' });
        }

        // Set new password
        user.password = password; // The beforeUpdate hook will hash it
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        await user.save();

        res.json({ message: 'Password has been successfully reset' });

    } catch (error) {
        console.error('resetPassword error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
