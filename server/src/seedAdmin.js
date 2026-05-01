import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User, { Role, Status } from './models/User.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sports_academy');
    console.log('Connected to DB');

    const adminExists = await User.findOne({ role: 'ADMIN' });
    if (adminExists) {
      console.log('Admin already exists. Use email: admin@sportsacademy.com, password: adminpassword');
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash('adminpassword', 12);

    const admin = new User({
      name: 'Super Admin',
      email: 'heyitsankitraj@gmail.com',
      phone: '9999999999',
      passwordHash,
      role: Role.ADMIN,
      sport: 'Admin', 
      status: Status.APPROVED, 
      isEmailVerified: true,   
    });

    await admin.save();
    console.log('Admin account created successfully!');
    console.log('Email: admin@sportsacademy.com');
    console.log('Password: adminpassword');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin', error);
    process.exit(1);
  }
};

seedAdmin();