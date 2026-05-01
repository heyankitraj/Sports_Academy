import mongoose, { Schema } from "mongoose";

export const Role = {
  ADMIN: "ADMIN",
  COACH: "COACH",
  STUDENT: "STUDENT",
} as const;

export const Status = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  ENROLLED: "ENROLLED",
  PAYMENT_PENDING: "PAYMENT_PENDING",
} as const;

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: Object.values(Role), required: true },
    sport: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(Status),
      default: Status.PENDING,
    },
    otpCode: { type: String },
    otpExpiry: { type: Date },
    isEmailVerified: { type: Boolean, default: false },

    // Athlete
    dob: { type: Date },
    age: { type: Number },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
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

    // Coach
    experience: { type: Number },
    certificationUrl: { type: String },
  },
  { timestamps: true },
);

// Pre-save age calculation
UserSchema.pre("save", function () {
  if (this.dob) {
    const today = new Date();
    const birth = new Date(this.dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    this.age = age;
  }
});

// Prevent model recompilation during hot-reload
export default mongoose.models.User ?? mongoose.model("User", UserSchema);
