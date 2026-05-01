import Session from '../models/Session.js';
import User, { Role, Status } from '../models/User.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// Helper function to email all enrolled students of a specific sport
const notifyStudents = async (sport, subject, htmlContent) => {
    try {
        const students = await User.find({ role: Role.STUDENT, sport, status: Status.ENROLLED });
        const emails = students.map(student => student.email);

        if (emails.length > 0) {
            await transporter.sendMail({
                from: `"Sports Academy" <${process.env.EMAIL_USER}>`,
                to: emails, // NodeMailer accepts an array to bulk-send
                subject,
                html: htmlContent
            });
            console.log(`Notification sent to ${emails.length} students for sport: ${sport}`);
        }
    } catch (error) {
        console.error('Failed to send session notifications to students:', error);
    }
};

export const createSession = async (req, res) => {
    try {
        // Only an APPROVED coach can create sessions
        if (req.user.status !== Status.APPROVED) {
            return res.status(403).json({ error: 'You must be an approved coach to create sessions.' });
        }

        const { title, sport, dateTime, duration, venue, description } = req.body;

        const session = new Session({
            coachId: req.user._id,
            title, sport, dateTime, duration, venue, description
        });

        await session.save();

        // Trigger Email Notification
        const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>📝 New ${sport} Session Scheduled!</h2>
        <p><b>Coach:</b> ${req.user.name}</p>
        <p><b>Topic:</b> ${title}</p>
        <p><b>Date & Time:</b> ${new Date(dateTime).toLocaleString()}</p>
        <p><b>Duration:</b> ${duration} minutes</p>
        <p><b>Location/Link:</b> ${venue}</p>
        <p><b>Notes:</b> ${description || 'N/A'}</p>
      </div>
    `;
        // We do not await this, we let it run in the background
        notifyStudents(sport, `New Session: ${title}`, emailHtml);

        res.status(201).json({ message: 'Session created successfully.', session });
    } catch (error) {
        console.error('Create session error:', error);
        res.status(500).json({ error: 'Failed to create session.' });
    }
};

export const getCoachSessions = async (req, res) => {
    try {
        const sessions = await Session.find({ coachId: req.user._id }).sort({ dateTime: 1 });
        res.status(200).json(sessions);
    } catch (error) {
        console.error('Fetch sessions error:', error);
        res.status(500).json({ error: 'Failed to fetch sessions.' });
    }
};

export const updateSession = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, dateTime, duration, venue, description } = req.body;

        const session = await Session.findOneAndUpdate(
            { _id: id, coachId: req.user._id },
            { title, dateTime, duration, venue, description },
            { new: true }
        );

        if (!session) {
            return res.status(404).json({ error: 'Session not found or unauthorized.' });
        }

        // Trigger Update Email
        const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>🔄 Session Updated: ${session.title}</h2>
        <p><b>Date & Time:</b> ${new Date(session.dateTime).toLocaleString()}</p>
        <p><b>Duration:</b> ${session.duration} minutes</p>
        <p><b>Location/Link:</b> ${session.venue}</p>
        <p><b>Notes:</b> ${session.description || 'N/A'}</p>
      </div>
    `;
        notifyStudents(session.sport, `Session Update: ${session.title}`, emailHtml);

        res.status(200).json({ message: 'Session updated successfully.', session });
    } catch (error) {
        console.error('Update session error:', error);
        res.status(500).json({ error: 'Failed to update session.' });
    }
};

export const deleteSession = async (req, res) => {
    try {
        const { id } = req.params;

        // Using findOneAndDelete ensures the coach only deletes their own session
        const session = await Session.findOneAndDelete({ _id: id, coachId: req.user._id });

        if (!session) {
            return res.status(404).json({ error: 'Session not found or unauthorized.' });
        }

        res.status(200).json({ message: 'Session deleted successfully.' });
    } catch (error) {
        console.error('Delete session error:', error);
        res.status(500).json({ error: 'Failed to delete session.' });
    }
};