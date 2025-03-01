const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const crypto = require('crypto');

// Constants
const JWT_EXPIRY = '24h';
const SALT_ROUNDS = 12;
const PASSWORD_RESET_EXPIRY = 3600000; // 1 hour

// Transporter setup (moved outside to avoid re-creating for each request)
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Security options
  secure: true, // Use TLS
  tls: {
    rejectUnauthorized: true, // Verify TLS certificates
  }
});

exports.signup = async (req, res) => {
  try {
    // Validate request using express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, mobileNumber, age, province, profilePicture } = req.body;

    // Check for required fields with specific feedback
    if (!name) return res.status(400).json({ message: 'Name is required' });
    if (!email) return res.status(400).json({ message: 'Email is required' });
    if (!password) return res.status(400).json({ message: 'Password is required' });
    if (!mobileNumber) return res.status(400).json({ message: 'Mobile number is required' });

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Check if user already exists (combined query for efficiency)
    const existingUser = await User.findOne({
      $or: [{ email }, { mobileNumber }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      if (existingUser.mobileNumber === mobileNumber) {
        return res.status(400).json({ message: 'Mobile number already in use' });
      }
    }

    // Hash password with stronger salt rounds
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Create new user with sanitized inputs
    const newUser = new User({
      userId: uuidv4(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      mobileNumber,
      age: age || null,
      province: province || null,
      profilePicture
    });

    const savedUser = await newUser.save();

    // Remove password from response
    const userResponse = savedUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: 'User created successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email (case insensitive)
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Use generic error message for security
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Rate limiting check (implement via middleware or a counter in the user model)
    if (user.loginAttempts >= 5 && user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(429).json({ 
        message: 'Account temporarily locked. Try again later or reset your password' 
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    
    // Handle failed login
    if (!isMatch) {
      // Update login attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      
      // Lock account after 5 failed attempts
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
      }
      
      await user.save();
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    // Generate JWT with proper payload structure
    const payload = { 
      userId: user._id,
      email: user.email,
      role: user.role || 'user'
    };
    
    const token = jwt.sign(
      payload, 
      process.env.JWT_SECRET, 
      { 
        expiresIn: JWT_EXPIRY,
        algorithm: 'HS256'
      }
    );

    // Set JWT as HTTP-only cookie for better security
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Also return token in response (for API clients)
    res.json({ 
      message: 'Login successful',
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role || 'user'
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.params; // Move to URL parameter instead of body
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
  
    const { name, age, province } = req.body;
    const profilePicture = req.file ? req.file.path : null;

    // Authorization check
    if (req.user.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to update this profile' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    if (name) user.name = name.trim();
    
    if (age !== undefined) {
      if (isNaN(age) || age < 0) {
        return res.status(400).json({ message: 'Age must be a positive number' });
      }
      user.age = age;
    }
    
    if (province) {
      // Validate province (assumed valid provinces list exists)
      const validProvinces = ['Province1', 'Province2', 'Province3']; // Replace with actual list
      if (!validProvinces.includes(province)) {
        return res.status(400).json({ message: 'Invalid province' });
      }
      user.province = province;
    }
    
    if (profilePicture) {
      // Additional validation for profile picture could be added here
      user.profilePicture = profilePicture;
    }

    await user.save();
    
    // Remove sensitive fields from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.resetPasswordToken;
    delete userResponse.resetPasswordExpires;
    
    res.status(200).json({ 
      message: 'Profile updated successfully', 
      user: userResponse 
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user by email (case insensitive)
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    // For security, don't reveal if user exists
    if (!user) {
      return res.status(200).json({ message: 'If your email exists in our system, you will receive a password reset link' });
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Store hashed token in database
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + PASSWORD_RESET_EXPIRY;
    await user.save();

    // Create reset URL with signed token
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Email with HTML template and security advice
    const mailOptions = {
      from: `"Account Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="max-width:600px; margin:0 auto; font-family:Arial, sans-serif;">
          <h2>Password Reset Request</h2>
          <p>You requested a password reset for your account.</p>
          <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
          <a href="${resetUrl}" style="display:inline-block; background-color:#4CAF50; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; margin:15px 0;">Reset Password</a>
          <p>If you didn't request this reset, please ignore this email and your password will remain unchanged.</p>
          <p>For security reasons, please do not share this link with anyone.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ 
      message: 'If your email exists in our system, you will receive a password reset link' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    const { token } = req.params;

    // Validate password
    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Hash the received token to compare with stored hash
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Set new password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    // Reset login attempts
    user.loginAttempts = 0;
    user.lockUntil = null;
    
    await user.save();

    // Send confirmation email
    const mailOptions = {
      from: `"Account Security" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Your Password Has Been Changed',
      text: `
        This is a confirmation that the password for your account ${user.email} has just been changed.
        If you did not make this change, please contact our support team immediately.
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};

// Admin functions with role checks
exports.getUsers = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Query with projection to exclude sensitive data
    const users = await User.find({}, { password: 0, resetPasswordToken: 0, resetPasswordExpires: 0 })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();

    res.json({
      users,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error while retrieving users' });
  }
};

exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if id is provided
    if (!id) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Validate id format (assuming MongoDB ObjectId)
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Find user first to check if it exists
    const user = await User.findById(id, { 
      password: 0, 
      resetPasswordToken: 0, 
      resetPasswordExpires: 0 
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    
    // Handle specific errors
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    // For any other error, return 500
    res.status(500).json({ message: 'Server error while retrieving user' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if id is provided
    if (!id) {
        return res.status(400).json({ message: 'User ID is required' });
      }
  

    // Authorization check (admin only or self-deletion)
    if (req.user.userId !== id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to delete this user' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(id);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
};

// Logout endpoint
exports.logout = (req, res) => {
  // Clear the auth cookie
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
};

// Middleware for protecting routes
exports.authenticate = (req, res, next) => {
  try {
    // Get token from cookie or auth header
    const token = req.cookies.token || 
                 (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user info to request
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired, please login again' });
    }
    return res.status(401).json({ message: 'Invalid authentication' });
  }
};

// Role-based authorization middleware
exports.authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    next();
  };
};