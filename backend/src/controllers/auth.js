const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendEmail, generateOtp } = require('../utils/mailer');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email and password'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    // Check if user exists
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Validate teacher password format
    if (role === 'teacher' && !password.startsWith('PDPU')) {
      return res.status(400).json({
        success: false,
        error: 'Teacher password must start with "PDPU"'
      });
    }

    // Generate OTP and expiry (15 minutes)
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

    // Create user (unverified initially)
    console.log('Creating user with data:', { name, email, role });
    user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || 'student',
      isVerified: false,
      emailVerificationOtp: otp,
      emailVerificationExpires: otpExpiry
    });

    console.log('User created successfully in database with ID:', user._id);

    // Verify user was created
    const verifiedUser = await User.findById(user._id);
    console.log('Verified user in database:', verifiedUser ? 'Found' : 'Not found');

    // Send OTP email
    let previewUrl = null;
    try {
      const info = await sendEmail({
        to: user.email,
        subject: 'Verify your email - OTP',
        html: `<p>Hi ${user.name},</p>
               <p>Your verification code is:</p>
               <h2 style="letter-spacing:4px">${otp}</h2>
               <p>This code expires in 15 minutes.</p>`
      });
      try {
        const nodemailer = require('nodemailer');
        if (nodemailer.getTestMessageUrl) {
          previewUrl = nodemailer.getTestMessageUrl(info);
          if (previewUrl) console.log('OTP email preview URL:', previewUrl);
        }
      } catch {}
    } catch (mailErr) {
      console.error('Error sending verification email:', mailErr);
    }

    // Respond without login token; require verification first
    const devExtras = process.env.NODE_ENV !== 'production' ? { otp, previewUrl } : {};
    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email with the OTP sent.',
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      },
      ...devExtras
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: errors.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Block unverified users
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        error: 'Email not verified. Please check your email for the OTP or request a new one.'
      });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Verify email with OTP
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, error: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(200).json({ success: true, message: 'Email already verified' });
    }

    if (!user.emailVerificationOtp || !user.emailVerificationExpires) {
      return res.status(400).json({ success: false, error: 'No OTP set. Please request a new one.' });
    }

    if (new Date() > user.emailVerificationExpires) {
      return res.status(400).json({ success: false, error: 'OTP expired. Please request a new one.' });
    }

    if (user.emailVerificationOtp !== otp) {
      return res.status(400).json({ success: false, error: 'Invalid OTP' });
    }

    user.isVerified = true;
    user.emailVerificationOtp = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    // Issue token on successful verification
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Verify email error:', error);
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Resend OTP to email
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(200).json({ success: true, message: 'Email already verified' });
    }

    const otp = generateOtp();
    user.emailVerificationOtp = otp;
    user.emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const info = await sendEmail({
      to: user.email,
      subject: 'Your new OTP code',
      html: `<p>Hi ${user.name},</p>
             <p>Your new verification code is:</p>
             <h2 style="letter-spacing:4px">${otp}</h2>
             <p>This code expires in 15 minutes.</p>`
    });
    let previewUrl = null;
    try {
      const nodemailer = require('nodemailer');
      if (nodemailer.getTestMessageUrl) previewUrl = nodemailer.getTestMessageUrl(info);
    } catch {}
    const devExtras = process.env.NODE_ENV !== 'production' ? { otp, previewUrl } : {};
    return res.status(200).json({ success: true, message: 'OTP resent successfully', ...devExtras });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
}; 