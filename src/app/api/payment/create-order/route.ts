import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import Payment from "@/lib/models/Payment";
import { getAuthUser } from "@/lib/auth";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY || "test_key",
  key_secret: process.env.RAZORPAY_SECRET || "test_secret",
});

const ENROLLMENT_FEE = 5000; // ₹5,000

// POST /api/payment/create-order
export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(authUser._id);
    if (!user || user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Only students can initiate payments." },
        { status: 403 },
      );
    }
    if (user.status !== "APPROVED") {
      return NextResponse.json(
        { error: "You must be approved by Admin to enroll." },
        { status: 400 },
      );
    }

    const options = {
      amount: ENROLLMENT_FEE * 100,
      currency: "INR",
      receipt: `receipt_${user._id}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    await new Payment({
      studentId: user._id,
      razorpayOrderId: order.id,
      amount: ENROLLMENT_FEE,
      status: "PENDING",
    }).save();

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Failed to create payment order." },
      { status: 500 },
    );
  }
}
