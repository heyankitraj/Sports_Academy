import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Session from "@/lib/models/Session";
import User from "@/lib/models/User";
import { getAuthUser } from "@/lib/auth";
import { sendBulkEmail } from "@/lib/email";

// GET /api/coach/sessions — list sessions for the authenticated coach
export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    if (authUser.role !== "COACH") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    await connectDB();
    const sessions = await Session.find({ coachId: authUser._id }).sort({
      dateTime: 1,
    });
    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Fetch sessions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions." },
      { status: 500 },
    );
  }
}

// POST /api/coach/sessions — create a new session
export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    if (authUser.role !== "COACH") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }
    if (authUser.status !== "APPROVED") {
      return NextResponse.json(
        { error: "You must be an approved coach to create sessions." },
        { status: 403 },
      );
    }

    await connectDB();
    const { title, sport, dateTime, duration, venue, description } =
      await req.json();

    const session = new Session({
      coachId: authUser._id,
      title,
      sport,
      dateTime,
      duration,
      venue,
      description,
    });
    await session.save();

    // Notify enrolled students of same sport (fire-and-forget)
    const students = await User.find({
      role: "STUDENT",
      sport,
      status: "ENROLLED",
    });
    const emails = students.map((s) => s.email);
    const html = `
      <div style="font-family:Arial,sans-serif;padding:20px;">
        <h2>📝 New ${sport} Session Scheduled!</h2>
        <p><b>Coach:</b> ${authUser.name}</p>
        <p><b>Topic:</b> ${title}</p>
        <p><b>Date & Time:</b> ${new Date(dateTime).toLocaleString()}</p>
        <p><b>Duration:</b> ${duration} minutes</p>
        <p><b>Location/Link:</b> ${venue}</p>
        <p><b>Notes:</b> ${description || "N/A"}</p>
      </div>`;
    sendBulkEmail(emails, `New Session: ${title}`, html);

    return NextResponse.json(
      { message: "Session created successfully.", session },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create session error:", error);
    return NextResponse.json(
      { error: "Failed to create session." },
      { status: 500 },
    );
  }
}
