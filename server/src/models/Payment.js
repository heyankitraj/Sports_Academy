import mongoose, { Schema } from 'mongoose';

const PaymentSchema = new Schema({
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    amount: { type: Number, required: true }, // Amount in INR
    status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED'], default: 'PENDING' },
    paidAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Payment', PaymentSchema);