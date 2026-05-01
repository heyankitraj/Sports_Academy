// MongoDB connection singleton — reused across hot-reloads in dev
import mongoose from "mongoose";

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/sports_academy";

// Store connection on the global object so it survives Next.js hot-reloads
declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn: typeof mongoose | null;
}

let cached = global._mongooseConn ?? null;

export async function connectDB() {
  if (cached) return cached;

  cached = await mongoose.connect(MONGO_URI);
  global._mongooseConn = cached;
  return cached;
}
