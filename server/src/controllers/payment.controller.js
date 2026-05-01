import crypto from 'crypto';
import Razorpay from 'razorpay';
import User, { Status, Role } from '../models/User.js';
import Payment from '../models/Payment.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY || 'test_key',
  key_secret: process.env.RAZORPAY_SECRET || 'test_secret'
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const ENROLLMENT_FEE = 5000; // ₹5000

export const createOrder = async (req, res) => {
  try {
    const studentId = req.user._id;
    const user = await User.findById(studentId);

    if (user.role !== Role.STUDENT) {
      return res.status(403).json({ error: 'Only students can initiate payments.' });
    }

    if (user.status !== Status.APPROVED) {
      return res.status(400).json({ error: 'You must be approved by an Admin to enroll.' });
    }

    const options = {
      amount: ENROLLMENT_FEE * 100, // Razorpay works in smallest currency unit (paise)
      currency: 'INR',
      receipt: `receipt_${studentId}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Save pending payment record
    const payment = new Payment({
      studentId,
      razorpayOrderId: order.id,
      amount: ENROLLMENT_FEE,
      status: 'PENDING'
    });
    await payment.save();

    res.status(200).json({ 
      orderId: order.id, 
      amount: order.amount, 
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY // Needed by frontend Razorpay checkout component
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ error: 'Failed to create payment order.' });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const studentId = req.user._id;

    // 1. Verify Signature
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET || 'test_secret')
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpaySignature;

    if (!isAuthentic) {
      // Mark as failed
      await Payment.findOneAndUpdate(
        { razorpayOrderId },
        { status: 'FAILED' }
      );
      return res.status(400).json({ error: 'Invalid payment signature. Payment failed validation.' });
    }

    // 2. Mark Payment as SUCCESS and Student as ENROLLED
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId },
      { 
        razorpayPaymentId, 
        razorpaySignature, 
        status: 'SUCCESS',
        paidAt: new Date()
      },
      { new: true }
    );

    const user = await User.findByIdAndUpdate(
      studentId, 
      { status: Status.ENROLLED },
      { new: true }
    );

    // 3. Send Confirmation Email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Welcome to Sports Academy, ${user.name}! 🏆</h2>
        <p>Your payment of <b>₹${payment.amount}</b> was successful.</p>
        <p><b>Transaction ID:</b> ${razorpayPaymentId}</p>
        <p>You are now fully <b>ENROLLED</b> in the ${user.sport} program.</p>
        <p>You will receive email notifications whenever your coach posts a new session.</p>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: `"Sports Academy" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Payment Successful - Enrollment Confirmed!',
        html: emailHtml
      });
    } catch (e) {
      console.error('Failed to send payment confirmation email, but payment succeeded:', e);
    }

    res.status(200).json({ message: 'Payment verified and enrollment complete!', payment });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment.' });
  }
};
