import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    if (authUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const query: Record<string, string> = {};
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const sport = searchParams.get("sport");
    if (role) query.role = role;
    if (status) query.status = status;
    if (sport) query.sport = sport;

    const users = await User.find(query)
      .select("-passwordHash -otpCode")
      .sort({ createdAt: -1 });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Fetch users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
