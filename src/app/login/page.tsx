/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/store/slices/authSlice";
import { api } from "@/lib/axios";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/auth/login", formData);
      const { user, message } = response.data;

      localStorage.setItem("user", JSON.stringify(user));
      dispatch(loginSuccess(user));
      toast.success(message || "Logged in successfully!");

      if (user.role === "ADMIN") router.push("/admin/dashboard");
      else if (user.role === "COACH") router.push("/coach/dashboard");
      else router.push("/student/dashboard");
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

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

        {/* Illustration / Info */}
        <div className="flex-1 flex flex-col justify-start">
          <div className="mb-6">
            {/* Decorative icon */}
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
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Sign in to access your dashboard, track your progress, and manage
              your activities.
            </p>
          </div>

          {/* Feature list */}
          <div className="flex flex-col gap-3 mt-2">
            {[
              "Track your training progress",
              "Connect with your coach",
              "View upcoming sessions",
            ].map((item, i) => (
              <motion.div
                key={item}
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.35 }}
              >
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="text-xs text-gray-500">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sign up link */}
        <div className="mt-auto pt-6 border-t border-gray-200">
          <Link
            href="/register"
            className="text-sm text-gray-500 transition-colors font-medium"
          >
            Don&apos;t have an account?{" "}
            <span className="text-blue-600">Register</span>
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
            Sign In to Your Account
          </h1>
          <motion.p
            className="text-xs sm:text-sm text-gray-500"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          >
            Enter your credentials to continue to your sports dashboard.
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
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div>
              <p className="text-sm sm:text-base font-bold text-gray-900">
                Account Login
              </p>
              <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">
                Securely sign in to access your academy portal
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="group">
              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                placeholder="john@example.com"
                className="w-full bg-white border border-gray-200 text-xs sm:text-sm rounded-xl px-3 py-2 sm:px-4 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-gray-800 placeholder-gray-400 hover:border-gray-300"
              />
            </div>

            {/* Password */}
            <div className="group">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-600">
                  Password <span className="text-red-500">*</span>
                </label>
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                placeholder="••••••••"
                className="w-full bg-white border border-gray-200 text-xs sm:text-sm rounded-xl px-3 py-2 sm:px-4 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-gray-800 placeholder-gray-400 hover:border-gray-300"
              />
            </div>

            {/* Submit Button */}
            <div className="mt-2">
              <motion.button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold text-white shadow-md flex items-center justify-center gap-2 ${
                  loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600"
                }`}
                whileHover={
                  !loading
                    ? {
                        scale: 1.02,
                        boxShadow: "0 8px 24px rgba(37,99,235,0.35)",
                      }
                    : {}
                }
                whileTap={!loading ? { scale: 0.97 } : {}}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                {loading ? "Signing in..." : "Sign In"}
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
        </motion.div>

        {/* Mobile: Register link */}
        <div className="mt-6 md:hidden text-center">
          <Link
            href="/register"
            className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
          >
            Don&apos;t have an account?{" "}
            <span className="text-blue-600 font-medium">Register</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
