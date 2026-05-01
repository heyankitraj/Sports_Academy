import mongoose, { Schema } from "mongoose";

const SessionSchema = new Schema(
  {
    coachId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sport: { type: String, required: true },
    title: { type: String, required: true },
    dateTime: { type: Date, required: true },
    duration: { type: Number, required: true },
    venue: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true },
);

export default mongoose.models.Session ??
  mongoose.model("Session", SessionSchema);
