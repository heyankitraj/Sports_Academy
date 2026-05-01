import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import User from "@/lib/models/User";
import { connectDB } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "fallback_refresh_secret_key";

export { JWT_SECRET, JWT_REFRESH_SECRET };

/** Extract the token from cookies or Authorization header */
export function extractToken(req: NextRequest): string | null {
  // Try cookie first
  const cookieToken = req.cookies.get("accessToken")?.value;
  if (cookieToken) return cookieToken;
  // Fallback to Bearer header
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);
  return null;
}

/** Verify token and return the full user document (or null) */
export async function getAuthUser(req: NextRequest) {
  await connectDB();
  const token = extractToken(req);
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      role: string;
    };
    const user = await User.findById(decoded.userId).select("-passwordHash");
    return user ?? null;
  } catch {
    return null;
  }
}

/** Set httpOnly JWT cookies on a Response */
export async function setAuthCookies(
  userId: string,
  role: string,
): Promise<void> {
  const payload = { userId, role };
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === "production";

  cookieStore.set("accessToken", accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    maxAge: 15 * 60,
    path: "/",
  });

  cookieStore.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });
}

/** Clear auth cookies */
export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
}
