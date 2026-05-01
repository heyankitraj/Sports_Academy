import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { getAuthUser } from "@/lib/auth";
import { sendStatusEmail } from "@/lib/email";

export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<"/api/admin/users/[id]/status">,
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    if (authUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    await connectDB();
    const { id } = await ctx.params;
    const { status } = await req.json();

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Only APPROVED or REJECTED allowed." },
        { status: 400 },
      );
    }

    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    ).select("-passwordHash");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role === "STUDENT" || user.role === "COACH") {
      await sendStatusEmail(user.email, status);
    }

    return NextResponse.json({
      message: `User successfully ${status.toLowerCase()}`,
      user,
    });
  } catch (error) {
    console.error("Status update error:", error);
    return NextResponse.json(
      { error: "Failed to update user status" },
      { status: 500 },
    );
  }
}
