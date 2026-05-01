import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User, { Status } from '../models/User.js';
import { generateOtp, sendOtpEmail } from '../services/email.service.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_key';

export const register = async (req, res) => {
  try {
    const { 
      name, email, phone, password, role, sport, dob, experience,
      gender, bloodGroup, guardianName, guardianRelationship, guardianPhone,
      address, currentClub, stateRepresenting, competitionAppliedFor,
      profilePhotoUrl, idProofUrl, addressProofUrl, medicalCertificateUrl, certificationUrl 
    } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const otpCode = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const user = new User({
      name, email, phone, passwordHash, role, sport, dob, experience,
      gender, bloodGroup, guardianName, guardianRelationship, guardianPhone,
      address, currentClub, stateRepresenting, competitionAppliedFor,
      profilePhotoUrl, idProofUrl, addressProofUrl, medicalCertificateUrl, certificationUrl,
      otpCode, otpExpiry, status: Status.PENDING, isEmailVerified: false
    });

    await user.save();
    try {
      await sendOtpEmail(email, otpCode);
    } catch (e) {
      console.error("Warning: email sending failed, but user created.", e);
    }

    res.status(201).json({ message: 'Registration successful. Please verify OTP sent to your email.' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed.', details: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: 'Email already verified.' });
    }

    if (user.otpCode !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    user.isEmailVerified = true;
    user.otpCode = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({ message: 'OTP verified successfully. Your account is under review by admin.' });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'Verification failed.' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Invalid email or password.' });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ error: 'Please verify your email using the OTP sent during registration.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const payload = { userId: user._id, role: user.role };
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    res.cookie('accessToken', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed.' });
  }
};
