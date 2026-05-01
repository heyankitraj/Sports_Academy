import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Session from "@/lib/models/Session";
import { getAuthUser } from "@/lib/auth";
import { sendBulkEmail } from "@/lib/email";
import User from "@/lib/models/User";

// PATCH /api/coach/sessions/[id]
export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<"/api/coach/sessions/[id]">,
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== "COACH") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectDB();
    const { id } = await ctx.params;
    const { title, dateTime, duration, venue, description } = await req.json();

    const session = await Session.findOneAndUpdate(
      { _id: id, coachId: authUser._id },
      { title, dateTime, duration, venue, description },
      { new: true },
    );

    if (!session) {
      return NextResponse.json(
        { error: "Session not found or unauthorized." },
        { status: 404 },
      );
    }

    // Notify enrolled students (fire-and-forget)
    const students = await User.find({
      role: "STUDENT",
      sport: session.sport,
      status: "ENROLLED",
    });
    const html = `
      <div style="font-family:Arial,sans-serif;padding:20px;">
        <h2>🔄 Session Updated: ${session.title}</h2>
        <p><b>Date & Time:</b> ${new Date(session.dateTime).toLocaleString()}</p>
        <p><b>Duration:</b> ${session.duration} minutes</p>
        <p><b>Location/Link:</b> ${session.venue}</p>
        <p><b>Notes:</b> ${session.description || "N/A"}</p>
      </div>`;
    sendBulkEmail(
      students.map((s) => s.email),
      `Session Update: ${session.title}`,
      html,
    );

    return NextResponse.json({ message: "Session updated.", session });
  } catch (error) {
    console.error("Update session error:", error);
    return NextResponse.json(
      { error: "Failed to update session." },
      { status: 500 },
    );
  }
}

// DELETE /api/coach/sessions/[id]
export async function DELETE(
  req: NextRequest,
  ctx: RouteContext<"/api/coach/sessions/[id]">,
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== "COACH") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectDB();
    const { id } = await ctx.params;

    const session = await Session.findOneAndDelete({
      _id: id,
      coachId: authUser._id,
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found or unauthorized." },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Session deleted successfully." });
  } catch (error) {
    console.error("Delete session error:", error);
    return NextResponse.json(
      { error: "Failed to delete session." },
      { status: 500 },
    );
  }
}
