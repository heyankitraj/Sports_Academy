import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/** Generate a 6-digit numeric OTP */
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtpEmail(to: string, otp: string) {
  await transporter.sendMail({
    from: `"Sports Academy" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Verify your Registration - Sports Academy",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Welcome to Sports Academy!</h2>
        <p>Your OTP for registration verification is:</p>
        <h1 style="color: #2563eb; letter-spacing: 4px;">${otp}</h1>
        <p>This OTP is valid for <b>10 minutes</b>.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });
}

export async function sendStatusEmail(
  to: string,
  status: "APPROVED" | "REJECTED",
  baseFee = 5000,
) {
  const subject =
    status === "APPROVED" ? "Application Approved!" : "Application Rejected";
  const html =
    status === "APPROVED"
      ? `<div style="font-family: Arial, sans-serif; padding: 20px;">
           <h2>Congratulations!</h2>
           <p>Your application has been <b>APPROVED</b>.</p>
           <p>Please complete your payment of ₹${baseFee} to confirm your enrollment.</p>
           <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/student/dashboard"
                style="background:#2563eb;color:white;padding:10px 15px;text-decoration:none;border-radius:6px;">Pay Now</a></p>
         </div>`
      : `<div style="font-family: Arial, sans-serif; padding: 20px;">
           <h2>Update on your Application</h2>
           <p>We regret to inform you that your application was <b>REJECTED</b> at this time.</p>
         </div>`;

  try {
    await transporter.sendMail({
      from: `"Sports Academy" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("Error sending status email:", err);
  }
}

export async function sendBulkEmail(
  emails: string[],
  subject: string,
  html: string,
) {
  if (emails.length === 0) return;
  try {
    await transporter.sendMail({
      from: `"Sports Academy" <${process.env.EMAIL_USER}>`,
      to: emails,
      subject,
      html,
    });
  } catch (err) {
    console.error("Failed to send bulk email:", err);
  }
}
