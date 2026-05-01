/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ChangeEvent, JSX, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"STUDENT" | "COACH">("STUDENT");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState<any>({
    name: "",
    email: "",
    phone: "",
    password: "",
    sport: "Cricket",
    dob: "",
    gender: "Male",
    bloodGroup: "",
    guardianName: "",
    guardianRelationship: "",
    guardianPhone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    currentClub: "",
    stateRepresenting: "",
    competitionAppliedFor: "",
    profilePhotoUrl: "",
    idProofUrl: "",
    addressProofUrl: "",
    medicalCertificateUrl: "",
    experience: "",
    certificationUrl: "",
  });

  const [files, setFiles] = useState<any>({
    profilePhoto: null,
    idProof: null,
    addressProof: null,
    medicalCertificate: null,
    certification: null,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string,
  ) => {
    if (e.target.files && e.target.files[0]) {
      setFiles({ ...files, [fieldName]: e.target.files[0] });
    }
  };

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const uploadFileAPI = async (file: File) => {
    const data = new FormData();
    data.append("file", file);
    try {
      const res = await api.post("/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.url;
    } catch (err: any) {
      toast.error(
        err.response?.data?.error || `Upload failed for ${file.name}`,
      );
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let profilePhotoUrl = formData.profilePhotoUrl;
      let idProofUrl = formData.idProofUrl;
      let addressProofUrl = formData.addressProofUrl;
      let medicalCertificateUrl = formData.medicalCertificateUrl;
      let certificationUrl = formData.certificationUrl;

      if (files.profilePhoto)
        profilePhotoUrl = await uploadFileAPI(files.profilePhoto);
      if (files.idProof) idProofUrl = await uploadFileAPI(files.idProof);
      if (files.addressProof)
        addressProofUrl = await uploadFileAPI(files.addressProof);
      if (files.medicalCertificate)
        medicalCertificateUrl = await uploadFileAPI(files.medicalCertificate);
      if (files.certification)
        certificationUrl = await uploadFileAPI(files.certification);

      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role,
        sport: formData.sport,
        dob: formData.dob || undefined,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        guardianName: formData.guardianName,
        guardianRelationship: formData.guardianRelationship,
        guardianPhone: formData.guardianPhone,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        currentClub: formData.currentClub,
        stateRepresenting: formData.stateRepresenting,
        competitionAppliedFor: formData.competitionAppliedFor,
        profilePhotoUrl,
        idProofUrl,
        addressProofUrl,
        medicalCertificateUrl,
        experience: role === "COACH" ? Number(formData.experience) : undefined,
        certificationUrl,
      };

      const response = await api.post("/auth/register", payload);
      toast.success(response.data.message || "Registration successful!");
      router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const athleteSteps = [
    { id: 1, label: "Personal Details" },
    { id: 2, label: "Guardian & Address" },
    { id: 3, label: "Club & Competition" },
    { id: 4, label: "Documents" },
  ];

  const coachSteps = [
    { id: 1, label: "Personal Details" },
    { id: 2, label: "Coach Details" },
    { id: 3, label: "Documents" },
  ];

  const currentSteps = role === "STUDENT" ? athleteSteps : coachSteps;
  const totalSteps = currentSteps.length;
  const progressPercent = Math.round((step / totalSteps) * 100);

  const stepIcons: Record<number, JSX.Element> = {
    1: (
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
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    2: (
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
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    3: (
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
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
    4: (
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
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14,2 14,8 20,8" />
      </svg>
    ),
  };

  const renderStep1 = () => (
    <div className="space-y-5">
      {/* Role Toggle */}
      <div className="flex gap-3 mb-6">
        <button
          type="button"
          onClick={() => {
            setRole("STUDENT");
            setStep(1);
          }}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
            role === "STUDENT"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          Athlete (Student)
        </button>
        <button
          type="button"
          onClick={() => {
            setRole("COACH");
            setStep(1);
          }}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
            role === "COACH"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          Coach
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <InputField
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <InputField
          label="Phone Number"
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          pattern="[0-9]{10}"
          title="10 digit mobile number"
        />
        <InputField
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
            Select Sport <span className="text-red-500">*</span>
          </label>
          <select
            name="sport"
            value={formData.sport}
            onChange={handleChange}
            className="w-full bg-white border border-gray-200 text-xs sm:text-sm rounded-xl px-3 py-2 sm:px-4 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-gray-800"
          >
            <option value="Cricket">Cricket</option>
            <option value="Football">Football</option>
          </select>
        </div>

        {role === "STUDENT" && (
          <>
            <InputField
              label="Date of Birth"
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              required
            />
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full bg-white border border-gray-200 text-xs sm:text-sm rounded-xl px-3 py-2 sm:px-4 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-gray-800"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <InputField
              label="Blood Group"
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
            />
          </>
        )}
      </div>
    </div>
  );

  const renderStep2Student = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          label="Guardian Name"
          name="guardianName"
          value={formData.guardianName}
          onChange={handleChange}
          required
        />
        <InputField
          label="Relationship with Guardian"
          name="guardianRelationship"
          value={formData.guardianRelationship}
          onChange={handleChange}
          required
        />
        <InputField
          label="Guardian Phone"
          type="tel"
          name="guardianPhone"
          value={formData.guardianPhone}
          onChange={handleChange}
          required
          pattern="[0-9]{10}"
        />
        <div className="sm:col-span-2 border-t border-gray-100 pt-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Home Address
          </p>
        </div>
        <InputField
          label="Street Address"
          name="street"
          value={formData.street}
          onChange={handleChange}
          required
        />
        <InputField
          label="City"
          name="city"
          value={formData.city}
          onChange={handleChange}
          required
        />
        <InputField
          label="State"
          name="state"
          value={formData.state}
          onChange={handleChange}
          required
        />
        <InputField
          label="Pincode"
          name="pincode"
          value={formData.pincode}
          onChange={handleChange}
          required
        />
      </div>
    </div>
  );

  const renderStep3Student = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          label="Current / Previous Club"
          name="currentClub"
          value={formData.currentClub}
          onChange={handleChange}
        />
        <InputField
          label="State Representing"
          name="stateRepresenting"
          value={formData.stateRepresenting}
          onChange={handleChange}
        />
        <InputField
          label="Competition Applied For"
          name="competitionAppliedFor"
          value={formData.competitionAppliedFor}
          onChange={handleChange}
          required
          className="sm:col-span-2"
        />
      </div>
    </div>
  );

  const renderStep2Coach = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          label="Years of Experience"
          type="number"
          name="experience"
          value={formData.experience}
          onChange={handleChange}
          required
          min="0"
        />
      </div>
    </div>
  );

  const renderStepDocuments = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
        <p className="text-sm text-blue-700">
          Please upload clear, legible documents. Max file size: 10MB per document (Images/PDFs).
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FileInput
          label="Profile Photo (JPG/PNG)"
          accept="image/*"
          onChange={(e: ChangeEvent<HTMLInputElement, Element>) =>
            handleFileChange(e, "profilePhoto")
          }
          required
        />
        <FileInput
          label="ID Proof (PDF/JPG)"
          accept="image/*,application/pdf"
          onChange={(e: ChangeEvent<HTMLInputElement, Element>) =>
            handleFileChange(e, "idProof")
          }
          required
        />
        {role === "STUDENT" && (
          <>
            <FileInput
              label="Address Proof (PDF/JPG)"
              accept="image/*,application/pdf"
              onChange={(e: ChangeEvent<HTMLInputElement, Element>) =>
                handleFileChange(e, "addressProof")
              }
              required
            />
            <FileInput
              label="Medical Certificate (PDF/JPG)"
              accept="image/*,application/pdf"
              onChange={(e: ChangeEvent<HTMLInputElement, Element>) =>
                handleFileChange(e, "medicalCertificate")
              }
              required
            />
          </>
        )}
        {role === "COACH" && (
          <FileInput
            label="Coach Certification (PDF/JPG)"
            accept="image/*,application/pdf"
            onChange={(e: ChangeEvent<HTMLInputElement, Element>) =>
              handleFileChange(e, "certification")
            }
            required
          />
        )}
      </div>
    </div>
  );

  const currentStepLabel = currentSteps.find((s) => s.id === step)?.label ?? "";
  const currentStepSubtitle: Record<string, string> = {
    "Personal Details":
      "Tell us about yourself so we can personalize your experience",
    "Guardian & Address": "Provide your guardian details and home address",
    "Club & Competition": "Share your sporting background and goals",
    "Coach Details": "Tell us about your coaching experience",
    Documents: "Upload the required documents to complete registration",
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
          style={{ background: "radial-gradient(circle, #bfdbfe 0%, transparent 70%)" }}
          animate={{ y: [0, -22, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 -right-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #a5b4fc 0%, transparent 70%)" }}
          animate={{ y: [0, -16, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute bottom-12 left-1/3 w-48 h-48 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #93c5fd 0%, transparent 70%)" }}
          animate={{ y: [0, -10, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
      </div>
      {/* ── Left Sidebar Stepper ── */}
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

        {/* Steps */}
        <nav className="flex flex-col gap-0 relative">
          {/* Vertical track line — from center of step 1 dot to center of last dot */}
          <div
            className="absolute left-[13px] w-[2px] rounded-full"
            style={{
              top: "30px",
              bottom: "30px",
              background: "#e2e8f0",
            }}
          />
          {/* Filled progress line */}
          <div
            className="absolute left-[13px] w-[2px] rounded-full transition-all duration-700 ease-in-out"
            style={{
              top: "30px",
              height:
                totalSteps > 1
                  ? `calc(${((step - 1) / (totalSteps - 1)) * 100}% * (1 - 60px / 100%))`
                  : "0%",
              background: "#2563eb",
            }}
          />

          {currentSteps.map((s) => {
            const isDone = step > s.id;
            const isActive = step === s.id;
            return (
              <div
                key={s.id}
                className="flex items-center gap-3 relative z-10 py-4"
              >
                {/* Circle */}
                <div
                  className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center transition-all duration-500 border-2 ${
                    isActive
                      ? "bg-blue-600 border-blue-600 shadow-lg shadow-blue-200 animate-pulse-ring"
                      : isDone
                        ? "bg-blue-600 border-blue-600"
                        : "bg-white border-gray-300"
                  }`}
                >
                  {isDone ? (
                    <svg
                      className="w-3.5 h-3.5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : isActive ? (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  ) : (
                    <div className="w-2 h-2 bg-gray-300 rounded-full" />
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-sm transition-colors duration-300 ${
                    isActive
                      ? "font-semibold text-gray-900"
                      : isDone
                        ? "font-medium text-gray-600"
                        : "font-medium text-gray-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </nav>

        {/* Sign in link */}
        <div className="mt-auto pt-6 border-t border-gray-200">
          <Link
            href="/login"
            className="text-sm text-gray-500 transition-colors font-medium"
          >
            Already have an account?{" "}
            <span className="text-blue-600">Sign in</span>
          </Link>
        </div>

        {/* Progress Badge */}
        <div className="mt-4 bg-white rounded-2xl shadow-md px-4 py-3 flex flex-col gap-2 border border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full border-2 border-blue-500 flex items-center justify-center">
              <svg
                className="w-3 h-3 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" d="M12 6v6l4 2" />
              </svg>
            </div>
            <span className="text-sm font-bold shimmer-text">
              {progressPercent}% completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <motion.div
              className="bg-blue-500 h-1.5 rounded-full"
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
            />
          </div>
          <span className="text-xs text-gray-400 font-medium">
            Step{" "}
            <span className="text-gray-600 font-semibold">
              {step}/{totalSteps}
            </span>
          </span>
        </div>
      </motion.aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col items-center justify-start px-3 pt-6 pb-8 sm:px-4 sm:pt-12 sm:pb-10 overflow-y-scroll relative z-10">
        {/* Page header */}
        <motion.div
          className="text-center mb-4 sm:mb-8 max-w-xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <h1 className="text-xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-1 sm:mb-2">
            Start Your Sports Journey
          </h1>
          <motion.p
            className="text-xs sm:text-sm text-gray-500"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          >
            Join our academy, get coached by experts, and track your progress —
            all in one place.
          </motion.p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-xl px-4 py-4 sm:px-8 sm:py-8 min-h-[340px] sm:min-h-[420px] flex flex-col"
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        >
          {/* Step Icon Header */}
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
              {stepIcons[step] ?? stepIcons[1]}
            </div>
            <div>
              <p className="text-sm sm:text-base font-bold text-gray-900">
                {currentStepLabel}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">
                {currentStepSubtitle[currentStepLabel]}
              </p>
            </div>
          </div>

          <form
            className="flex flex-col flex-1"
            onSubmit={
              step === totalSteps
                ? handleSubmit
                : (e) => {
                    e.preventDefault();
                    handleNext();
                  }
            }
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`step-${step}-${role}`}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
              {step === 1 && renderStep1()}
              {role === "STUDENT" && step === 2 && renderStep2Student()}
              {role === "STUDENT" && step === 3 && renderStep3Student()}
              {role === "STUDENT" && step === 4 && renderStepDocuments()}
              {role === "COACH" && step === 2 && renderStep2Coach()}
              {role === "COACH" && step === 3 && renderStepDocuments()}
              </motion.div>
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="mt-auto pt-5 sm:pt-8 flex items-center justify-between gap-3">
              {step > 1 ? (
                <motion.button
                  type="button"
                  onClick={handlePrev}
                  className="flex items-center gap-1.5 px-4 py-2 sm:px-6 sm:py-3 rounded-full text-xs sm:text-sm font-semibold text-gray-600 bg-white border border-gray-200 shadow-sm"
                  whileHover={{ scale: 1.03, backgroundColor: "#f9fafb" }}
                  whileTap={{ scale: 0.96 }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Back
                </motion.button>
              ) : (
                <div />
              )}
              <motion.button
                type="submit"
                disabled={loading}
                className={`px-5 py-2 sm:px-8 sm:py-3 rounded-full text-xs sm:text-sm font-bold text-white shadow-md flex items-center gap-2 ${
                  loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600"
                }`}
                whileHover={!loading ? { scale: 1.04, boxShadow: "0 8px 24px rgba(37,99,235,0.35)" } : {}}
                whileTap={!loading ? { scale: 0.96 } : {}}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                {step === totalSteps
                  ? loading ? "Submitting..." : "Complete Registration"
                  : "Continue"}
                {!loading && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Mobile: Sign in link */}
        <div className="mt-6 md:hidden text-center">
          <Link
            href="/login"
            className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
          >
            Already have an account?{" "}
            <span className="text-blue-600 font-medium">Sign in</span>
          </Link>
        </div>
      </main>
    </div>
  );
}

// ── Reusable Input ──
const InputField = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  required = false,
  className = "",
  ...props
}: any) => (
  <div className={`${className} group`}>
    <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full bg-white border border-gray-200 text-xs sm:text-sm rounded-xl px-3 py-2 sm:px-4 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-gray-800 placeholder-gray-400 hover:border-gray-300"
      {...props}
    />
  </div>
);

// ── Reusable File Input ──
const FileInput = ({ label, onChange, accept, required = false }: any) => (
  <div className="group">
    <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type="file"
      onChange={onChange}
      accept={accept}
      required={required}
      className="w-full bg-white border border-dashed border-gray-300 text-xs sm:text-sm rounded-xl px-2 py-2 sm:px-3 sm:py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer cursor-pointer"
    />
  </div>
);
