import User, { Role, Status } from '../models/User.js';
import ExcelJS from 'exceljs';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendStatusEmail = async (to, status, baseFee = 5000) => {
  const subject = status === Status.APPROVED ? 'Application Approved!' : 'Application Rejected';
  let html = '';

  if (status === Status.APPROVED) {
    html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Congratulations!</h2>
        <p>Your application has been <b>APPROVED</b>.</p>
        <p>Please complete your payment of ₹${baseFee} to confirm your enrollment.</p>
        <p><a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/student/dashboard" style="background: #4A90E2; color: white; padding: 10px 15px; text-decoration: none;">Pay Now</a></p>
      </div>
    `;
  } else {
    html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Update on your Application</h2>
        <p>We regret to inform you that your application was <b>REJECTED</b> at this time.</p>
      </div>
    `;
  }

  try {
    await transporter.sendMail({ from: `"Sports Academy" <${process.env.EMAIL_USER}>`, to, subject, html });
  } catch (error) {
    console.error('Error sending status update email:', error);
  }
};

export const getUsers = async (req, res) => {
  try {
    const { role, status, sport } = req.query;
    const query = {};

    if (role) query.role = role;
    if (status) query.status = status;
    if (sport) query.sport = sport;

    const users = await User.find(query).select('-passwordHash -otpCode').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (![Status.APPROVED, Status.REJECTED].includes(status)) {
      return res.status(400).json({ error: 'Invalid status update. Only APPROVED or REJECTED allowed here.' });
    }

    const user = await User.findByIdAndUpdate(id, { status }, { new: true }).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === Role.STUDENT || user.role === Role.COACH) {
      await sendStatusEmail(user.email, user.status);
    }

    res.status(200).json({ message: `User successfully ${status.toLowerCase()}`, user });
  } catch (error) {
    console.error('User status update error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

export const exportUsers = async (req, res) => {
  try {
    const { type } = req.query; // all-students, selected-paid, selected-unpaid, rejected-students, all-coaches
    let query = {};
    let filename = 'report.xlsx';

    switch (type) {
      case 'all-students':
        query.role = Role.STUDENT;
        filename = 'all-students.xlsx';
        break;
      case 'selected-paid':
        query = { role: Role.STUDENT, status: Status.ENROLLED };
        filename = 'selected-paid-students.xlsx';
        break;
      case 'selected-unpaid':
        query = { role: Role.STUDENT, status: Status.APPROVED };
        filename = 'selected-unpaid-students.xlsx';
        break;
      case 'rejected-students':
        query = { role: Role.STUDENT, status: Status.REJECTED };
        filename = 'rejected-students.xlsx';
        break;
      case 'all-coaches':
        query.role = Role.COACH;
        filename = 'all-coaches.xlsx';
        break;
      default:
        return res.status(400).json({ error: 'Invalid export type requested' });
    }

    const users = await User.find(query).select('-passwordHash -otpCode').lean();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Export Data');

    sheet.columns = [
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Sport', key: 'sport', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Role', key: 'role', width: 15 },
      { header: 'Age', key: 'age', width: 10 },
      { header: 'DOB', key: 'dob', width: 15 },
      { header: 'Gender', key: 'gender', width: 15 },
      { header: 'Blood Group', key: 'bloodGroup', width: 15 },
      { header: 'Guardian Name', key: 'guardianName', width: 25 },
      { header: 'Guardian Phone', key: 'guardianPhone', width: 15 },
      { header: 'City', key: 'city', width: 15 },
      { header: 'State', key: 'state', width: 15 },
      { header: 'Competition', key: 'competitionAppliedFor', width: 20 },
      { header: 'Profile Photo', key: 'profilePhotoUrl', width: 40 },
      { header: 'ID Proof', key: 'idProofUrl', width: 40 },
      { header: 'Signup Date', key: 'createdAt', width: 20 },
    ];

    users.forEach(user => {
      sheet.addRow({
        ...user,
        city: user.address?.city || '',
        state: user.address?.state || '',
        createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
        dob: user.dob ? new Date(user.dob).toLocaleDateString() : 'N/A'
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).json({ error: 'Failed to generate Excel export' });
  }
};