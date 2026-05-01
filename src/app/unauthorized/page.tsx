"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function UnauthorizedPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center font-sans relative overflow-hidden"
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

      <motion.div
        className="z-10 bg-white p-10 md:p-14 rounded-2xl shadow-xl border border-gray-100 max-w-lg w-full text-center mx-4"
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-50 text-red-600 flex items-center justify-center rounded-2xl shadow-sm">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        </div>
        
        <h1 className="text-3xl md:text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
          Access Denied
        </h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Oops! You don't have the permission to access this page. Please ensure you are logged in with the correct account.
        </p>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-sm"
          >
            Go to Login
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
