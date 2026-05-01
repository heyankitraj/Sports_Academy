import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User, { Status } from "@/lib/models/User";
import { generateOtp, sendOtpEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const {
      name, email, phone, password, role, sport, dob, experience,
      gender, bloodGroup, guardianName, guardianRelationship, guardianPhone,
      address, currentClub, stateRepresenting, competitionAppliedFor,
      profilePhotoUrl, idProofUrl, addressProofUrl, medicalCertificateUrl,
      certificationUrl,
    } = body;

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "User with this email already exists." },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const otpCode = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const user = new User({
      name, email, phone, passwordHash, role, sport, dob, experience,
      gender, bloodGroup, guardianName, guardianRelationship, guardianPhone,
      address, currentClub, stateRepresenting, competitionAppliedFor,
      profilePhotoUrl, idProofUrl, addressProofUrl, medicalCertificateUrl,
      certificationUrl, otpCode, otpExpiry,
      status: Status.PENDING, isEmailVerified: false,
    });

    await user.save();

    try {
      await sendOtpEmail(email, otpCode);
    } catch (e) {
      console.error("Warning: OTP email failed, but user created.", e);
    }

    return NextResponse.json(
      { message: "Registration successful. Please verify OTP sent to your email." },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("Registration error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Registration failed.", details: msg },
      { status: 500 },
    );
  }
}
