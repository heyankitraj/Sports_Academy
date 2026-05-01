import mongoose, { Schema } from 'mongoose';

export const Role = {
  ADMIN: 'ADMIN',
  COACH: 'COACH',
  STUDENT: 'STUDENT',
};

export const Status = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  ENROLLED: 'ENROLLED',
  PAYMENT_PENDING: 'PAYMENT_PENDING'
};

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: Object.values(Role), required: true },
  sport: { type: String, required: true },
  status: { type: String, enum: Object.values(Status), default: Status.PENDING },
  otpCode: { type: String },
  otpExpiry: { type: Date },
  isEmailVerified: { type: Boolean, default: false },

  // Athlete Form Details
  dob: { type: Date },
  age: { type: Number },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  bloodGroup: { type: String },

  guardianName: { type: String },
  guardianRelationship: { type: String },
  guardianPhone: { type: String },

  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
  },

  currentClub: { type: String },
  stateRepresenting: { type: String },
  competitionAppliedFor: { type: String },

  // Documents
  profilePhotoUrl: { type: String },
  idProofUrl: { type: String },
  addressProofUrl: { type: String },
  medicalCertificateUrl: { type: String },

  // Coach Specific
  experience: { type: Number },
  certificationUrl: { type: String },
}, { timestamps: true });

// Pre-save hook to calculate age based on dob
UserSchema.pre('save', function () {
  if (this.dob) {
    const today = new Date();
    const birthDate = new Date(this.dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    this.age = age;
  }
});

export default mongoose.model('User', UserSchema);
