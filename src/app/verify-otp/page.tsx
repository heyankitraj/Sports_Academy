/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/axios";
import toast from "react-hot-toast";
import Link from "next/link";
import { motion } from "framer-motion";

// ── OTP Form (needs Suspense because it reads searchParams) ──
function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/auth/verify-otp", { email, otp });
      toast.success(response.data.message || "Verified successfully!");
      router.push("/login");
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || "Invalid OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const isEmailPrefilled = !!searchParams.get("email");

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Email */}
      <div className="group">
        <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
          Email Address
        </label>
        <input
          type="email"
          required
          readOnly={isEmailPrefilled}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`w-full bg-white border border-gray-200 text-xs sm:text-sm rounded-xl px-3 py-2 sm:px-4 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-gray-800 placeholder-gray-400 hover:border-gray-300 ${
            isEmailPrefilled ? "opacity-60 cursor-not-allowed" : ""
          }`}
        />
      </div>

      {/* OTP */}
      <div className="group">
        <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
          6-Digit OTP
        </label>
        <input
          type="text"
          required
          maxLength={6}
          placeholder="• • • • • •"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 sm:px-4 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-gray-800 text-center text-xl sm:text-2xl tracking-[0.4em] font-mono hover:border-gray-300"
        />
        <p className="text-xs text-gray-400 mt-1.5 text-center">
          Enter the 6-digit code sent to your email
        </p>
      </div>

      {/* Submit */}
      <div className="mt-2">
        <motion.button
          type="submit"
          disabled={loading || otp.length !== 6}
          className={`w-full py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold text-white shadow-md flex items-center justify-center gap-2 transition-colors ${
            loading || otp.length !== 6
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-600"
          }`}
          whileHover={
            !loading && otp.length === 6
              ? { scale: 1.02, boxShadow: "0 8px 24px rgba(37,99,235,0.35)" }
              : {}
          }
          whileTap={!loading && otp.length === 6 ? { scale: 0.97 } : {}}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          {loading ? "Verifying..." : "Verify Account"}
          {!loading && (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          )}
        </motion.button>
      </div>
    </form>
  );
}

// ── Page ──
export default function VerifyOtpPage() {
  return (
    <div
      className="min-h-screen flex font-sans relative overflow-hidden"
      style={{ background: "#f0f2f7" }}
    >
      {/* ── Floating background blobs ── */}
      <div className="pointer-events-none select-none fixed inset-0 z-0">
        <motion.div
          className="absolute -top-24 -left-24 w-80 h-80 rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, #bfdbfe 0%, transparent 70%)",
          }}
          animate={{ y: [0, -22, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 -right-32 w-96 h-96 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, #a5b4fc 0%, transparent 70%)",
          }}
          animate={{ y: [0, -16, 0], scale: [1, 1.06, 1] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute bottom-12 left-1/3 w-48 h-48 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, #93c5fd 0%, transparent 70%)",
          }}
          animate={{ y: [0, -10, 0], rotate: [0, 8, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
      </div>

      {/* ── Left Sidebar ── */}
      <motion.aside
        className="hidden md:flex w-[220px] lg:w-[250px] flex-col pt-8 pb-6 px-6 relative z-10"
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center font-extrabold rounded-lg text-sm shadow">
            SA
          </div>
          <span className="font-extrabold text-lg tracking-tight text-gray-800">
            Sports Academy
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-start">
          <div className="mb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mb-5 shadow-lg shadow-blue-200">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.86 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.09 6.09l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Check Your Email
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              We&apos;ve sent a 6-digit verification code to your registered
              email address.
            </p>
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-3 mt-2">
            {[
              "Check your inbox for the OTP",
              "Enter the 6-digit code",
              "Start your sports journey",
            ].map((item, i) => (
              <motion.div
                key={item}
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.35 }}
              >
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <span className="text-blue-600 font-bold text-[10px]">
                    {i + 1}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Back to login */}
        <div className="mt-auto pt-6 border-t border-gray-200">
          <Link
            href="/login"
            className="text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium"
          >
            Back to{" "}
            <span className="text-blue-600">Sign In</span>
          </Link>
        </div>
      </motion.aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-3 py-6 sm:px-4 sm:py-10 overflow-y-scroll relative z-10">
        {/* Page header */}
        <motion.div
          className="text-center mb-4 sm:mb-8 max-w-xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <h1 className="text-xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-1 sm:mb-2">
            Verify Your Email
          </h1>
          <motion.p
            className="text-xs sm:text-sm text-gray-500"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          >
            We&apos;ve sent a 6-digit OTP to your email. Enter it below to
            activate your account.
          </motion.p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-xl px-4 py-4 sm:px-8 sm:py-8 flex flex-col"
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        >
          {/* Card Header */}
          <div className="flex items-center gap-2 sm:gap-3 mb-5 sm:mb-7">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <div>
              <p className="text-sm sm:text-base font-bold text-gray-900">
                Email Verification
              </p>
              <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">
                Enter the OTP sent to your inbox to verify your account
              </p>
            </div>
          </div>

          <Suspense
            fallback={
              <div className="text-center py-8 text-gray-400 text-sm">
                Loading...
              </div>
            }
          >
            <VerifyOtpForm />
          </Suspense>
        </motion.div>

        {/* Mobile: back to login */}
        <div className="mt-6 md:hidden text-center">
          <Link
            href="/login"
            className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
          >
            Back to{" "}
            <span className="text-blue-600 font-medium">Sign In</span>
          </Link>
        </div>
      </main>
    </div>
  );
}