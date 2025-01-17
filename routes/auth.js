const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer'); // Add this line

// Utility function for validation
const validateUserInput = (fields) => {
    return fields.every(field => field);
};

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Get token from Authorization header
    if (!token) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden
        req.user = user; // Save user info to request
        next(); // Proceed to the next middleware or route handler
    });
};



// Signup Route
router.post('/signup', async (req, res) => {
    const { name, email, password, mobileNumber, age, province, profilePicture } = req.body;

    // Validate input
    if (!validateUserInput([name, email, password, mobileNumber])) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        const existingUserByEmail = await User.findOne({ email });
        const existingUserByMobile = await User.findOne({ mobileNumber }); // Check for existing mobile number

        if (existingUserByEmail) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        if (existingUserByMobile) {
            return res.status(400).json({ message: 'Mobile number already in use' }); // Handle existing mobile number case
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            userId: uuidv4(),
            name,
            email,
            password: hashedPassword,
            mobileNumber, // Ensure this is included
            age,
            province,
            profilePicture
        });
        await newUser.save();

        res.status(201).json({ 
            message: 'User created successfully', 
            user: { 
                id: newUser._id, 
                name: newUser.name, 
                email: newUser.email, 
                mobileNumber: newUser.mobileNumber 
            } 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!validateUserInput([email, password])) {
        return res.status(400).json({ message: 'Please provide email and password' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, userId: user._id, user: { name: user.name, email: user.email } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update Profile Route
router.put('/update-profile', async (req, res) => {
    const { userId, name, age, province, profilePicture } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user fields
        if (name) user.name = name; // Update name if provided
        if (age !== undefined) user.age = age; // Update age if provided
        if (province) user.province = province; // Update province if provided
        if (profilePicture) user.profilePicture = profilePicture; // Update profile picture if provided

        await user.save();
        res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Forgot Password Route
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Please provide your email' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Generate a reset token
        const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Send email with reset link
        const transporter = nodemailer.createTransport({
            service: 'Gmail', // Use your email service
            auth: {
                user: process.env.EMAIL_USER, // Your email
                pass: process.env.EMAIL_PASS, // Your email password
            },
        });

        const mailOptions = {
            to: email,
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
                  `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
                  `http://localhost:5001/api/auth/reset-password/${resetToken}\n\n` +
                  `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Reset link sent to your email' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Reset Password Route
router.post('/reset-password/:token', async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ message: 'Token is invalid or has expired' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = null; // Clear the reset token
        user.resetPasswordExpires = null; // Clear the expiration
        await user.save();

        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get All Users Route
router.get('/getusers', async (req, res) => {
    try {
        const users = await User.find(); // Fetch all users
        res.json(users); // Send the users as a response
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete User Route
router.delete('/delete-user', async (req, res) => {
    const { userId } = req.body; // Assuming you send the user ID in the request body

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Get User Information Route
router.get('/user/:id', async (req, res) => {
    const { id } = req.params; // Get user ID from the request parameters

    try {
        const user = await User.findById(id); // Fetch user by ID
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return user information excluding the password
        res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            mobileNumber: user.mobileNumber,
            age: user.age,
            province: user.province,
            profilePicture: user.profilePicture,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});



module.exports = router;
