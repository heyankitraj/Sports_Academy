import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { getAuthUser } from "@/lib/auth";
import ExcelJS from "exceljs";

const EXPORT_TYPES: Record<string, Record<string, string>> = {
  "all-students": { role: "STUDENT" },
  "selected-paid": { role: "STUDENT", status: "ENROLLED" },
  "selected-unpaid": { role: "STUDENT", status: "APPROVED" },
  "rejected-students": { role: "STUDENT", status: "REJECTED" },
  "all-coaches": { role: "COACH" },
};

const FILENAMES: Record<string, string> = {
  "all-students": "all-students.xlsx",
  "selected-paid": "selected-paid-students.xlsx",
  "selected-unpaid": "selected-unpaid-students.xlsx",
  "rejected-students": "rejected-students.xlsx",
  "all-coaches": "all-coaches.xlsx",
};

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
    const type = new URL(req.url).searchParams.get("type") ?? "";

    if (!EXPORT_TYPES[type]) {
      return NextResponse.json(
        { error: "Invalid export type." },
        { status: 400 },
      );
    }

    const users = await User.find(EXPORT_TYPES[type])
      .select("-passwordHash -otpCode")
      .lean();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Export Data");

    sheet.columns = [
      { header: "Name", key: "name", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Sport", key: "sport", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "Role", key: "role", width: 15 },
      { header: "Age", key: "age", width: 10 },
      { header: "DOB", key: "dob", width: 15 },
      { header: "Gender", key: "gender", width: 15 },
      { header: "Blood Group", key: "bloodGroup", width: 15 },
      { header: "Guardian Name", key: "guardianName", width: 25 },
      { header: "Guardian Phone", key: "guardianPhone", width: 15 },
      { header: "City", key: "city", width: 15 },
      { header: "State", key: "state", width: 15 },
      { header: "Competition", key: "competitionAppliedFor", width: 20 },
      { header: "Profile Photo", key: "profilePhotoUrl", width: 40 },
      { header: "ID Proof", key: "idProofUrl", width: 40 },
      { header: "Signup Date", key: "createdAt", width: 20 },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    users.forEach((u: any) => {
      sheet.addRow({
        ...u,
        city: u.address?.city ?? "",
        state: u.address?.state ?? "",
        createdAt: u.createdAt
          ? new Date(u.createdAt).toLocaleDateString()
          : "N/A",
        dob: u.dob ? new Date(u.dob).toLocaleDateString() : "N/A",
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${FILENAMES[type]}"`,
      },
    });
  } catch (error) {
    console.error("Excel export error:", error);
    return NextResponse.json(
      { error: "Failed to generate Excel export" },
      { status: 500 },
    );
  }
}
