import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import Payment from "@/lib/models/Payment";
import { getAuthUser } from "@/lib/auth";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// POST /api/payment/verify
export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectDB();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } =
      await req.json();

    // Verify Razorpay signature
    const expectedSig = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET || "test_secret")
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSig !== razorpaySignature) {
      await Payment.findOneAndUpdate(
        { razorpayOrderId },
        { status: "FAILED" },
      );
      return NextResponse.json(
        { error: "Invalid payment signature. Payment failed validation." },
        { status: 400 },
      );
    }

    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId },
      {
        razorpayPaymentId,
        razorpaySignature,
        status: "SUCCESS",
        paidAt: new Date(),
      },
      { new: true },
    );

    const user = await User.findByIdAndUpdate(
      authUser._id,
      { status: "ENROLLED" },
      { new: true },
    );

    // Enrollment confirmation email
    try {
      await transporter.sendMail({
        from: `"Sports Academy" <${process.env.EMAIL_USER}>`,
        to: user!.email,
        subject: "Payment Successful - Enrollment Confirmed!",
        html: `
          <div style="font-family:Arial,sans-serif;padding:20px;">
            <h2>Welcome to Sports Academy, ${user!.name}! 🏆</h2>
            <p>Your payment of <b>₹${payment!.amount}</b> was successful.</p>
            <p><b>Transaction ID:</b> ${razorpayPaymentId}</p>
            <p>You are now fully <b>ENROLLED</b> in the ${user!.sport} program.</p>
          </div>`,
      });
    } catch (e) {
      console.error("Confirmation email failed:", e);
    }

    return NextResponse.json({
      message: "Payment verified and enrollment complete!",
      payment,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment." },
      { status: 500 },
    );
  }
}
