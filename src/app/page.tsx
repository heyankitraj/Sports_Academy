"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center font-sans relative overflow-hidden pb-12"
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
          className="absolute top-1/2 -right-32 w-[30rem] h-[30rem] rounded-full opacity-20"
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
          className="absolute bottom-12 left-1/4 w-64 h-64 rounded-full opacity-20"
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

      {/* ── Hero Glass Card ── */}
      <motion.div
        className="z-10 bg-white/70 backdrop-blur-xl p-10 md:p-16 rounded-[2.5rem] shadow-xl border border-white max-w-4xl w-full text-center mx-4 mt-20"
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <div className="w-20 h-20 bg-blue-600 text-white flex items-center justify-center font-extrabold rounded-3xl shadow-lg text-3xl">
            SA
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6"
        >
          Welcome to <span className="text-blue-600">Sports Academy</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-lg md:text-xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          Your premier destination for professional sports coaching and athletic development. Join us today and elevate your game to the next level.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
            <Link
              href="/register"
              className="flex items-center justify-center w-full sm:w-48 py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-md hover:shadow-lg text-lg"
            >
              Get Started
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
            <Link
              href="/login"
              className="flex items-center justify-center w-full sm:w-48 py-4 px-6 bg-white border-2 border-gray-200 hover:border-blue-200 text-gray-700 hover:text-blue-600 font-bold rounded-2xl transition-all shadow-sm hover:shadow text-lg"
            >
              Sign In
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ── Footer Features ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="z-10 mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-4xl mx-4 px-4"
      >
        <div className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/50 shadow-sm">
          <div className="w-14 h-14 mx-auto bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-5">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h3 className="font-bold text-gray-900 mb-2 text-lg">Expert Coaching</h3>
          <p className="text-sm text-gray-500 leading-relaxed">Learn from certified professionals with years of competitive experience.</p>
        </div>
        <div className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/50 shadow-sm">
          <div className="w-14 h-14 mx-auto bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-5">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <h3 className="font-bold text-gray-900 mb-2 text-lg">Premium Facilities</h3>
          <p className="text-sm text-gray-500 leading-relaxed">Train in state-of-the-art facilities equipped for every major sport.</p>
        </div>
        <div className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/50 shadow-sm">
          <div className="w-14 h-14 mx-auto bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-5">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
          <h3 className="font-bold text-gray-900 mb-2 text-lg">Community</h3>
          <p className="text-sm text-gray-500 leading-relaxed">Join a thriving community of dedicated athletes and competitive peers.</p>
        </div>
      </motion.div>
    </div>
  );
}
