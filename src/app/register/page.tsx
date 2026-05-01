/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import Link from "next/link";
import toast from "react-hot-toast";

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
    certificationUrl: "", // Coach specific
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

  const renderStep1 = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex border-b border-gray-200 mb-6 pb-2 space-x-6">
        <button
          type="button"
          onClick={() => setRole("STUDENT")}
          className={`pb-2 text-sm font-semibold transition-colors ${role === "STUDENT" ? "border-b-2 border-black text-black" : "text-gray-400 hover:text-black"}`}
        >
          Athlete (Student)
        </button>
        <button
          type="button"
          onClick={() => setRole("COACH")}
          className={`pb-2 text-sm font-semibold transition-colors ${role === "COACH" ? "border-b-2 border-black text-black" : "text-gray-400 hover:text-black"}`}
        >
          Coach
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Sport
          </label>
          <select
            name="sport"
            value={formData.sport}
            onChange={handleChange}
            className="w-full bg-[#f4f4f5] border border-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition-all"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full bg-[#f4f4f5] border border-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition-all"
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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

        <div className="col-span-1 border-t border-gray-100 my-2 sm:col-span-2"></div>

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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <InputField
          label="Current/Previous Club"
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-500">
          Please upload relevant, clear documents. Maximum image size is 1MB and
          PDF size is 2MB.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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

  return (
    <div className="min-h-screen flex bg-white text-black font-sans">
      {/* Left Sidebar - Stepper */}
      <div className="hidden md:flex w-[280px] lg:w-[320px] bg-[#fafafa] border-r border-gray-200 flex-col p-8 justify-between">
        <div>
          {/* Brand / Logo */}
          <div className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold italic rounded">
              E
            </div>
            <span className="font-extrabold text-xl tracking-tight">
              Academy
            </span>
          </div>

          <h1 className="text-2xl font-bold mb-2 text-black">Registration</h1>
          <p className="text-sm text-gray-500 leading-relaxed mb-10">
            Please fill out your details and confirm your information to
            proceed.
          </p>

          {/* Stepper Navigation */}
          <div className="flex flex-col space-y-6 relative">
            {/* Background Gray Line */}
            <div className="absolute left-[7.5px] top-2 bottom-2 w-[2px] bg-gray-200 -z-10" />

            {/* Animated Black Line Wrapper */}
            <div className="absolute left-[7.5px] top-2 bottom-2 w-[2px] bg-transparent -z-10 flex flex-col justify-start overflow-hidden">
              {/* The actual black line that grows downwards */}
              <div
                className="w-full bg-black transition-all duration-700 ease-in-out"
                style={{ height: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
              />
            </div>

            {currentSteps.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-4 relative z-10 transition-all duration-300"
              >
                {/* Icon / Indicator */}
                <div
                  className={`w-4 h-4 rounded-full flex-shrink-0 transition-all duration-500 flex items-center justify-center ${
                    step === s.id
                      ? "bg-black ring-4 ring-gray-100"
                      : step > s.id
                        ? "bg-black"
                        : "bg-gray-200"
                  }`}
                >
                  {step > s.id && (
                    <svg
                      className="w-2.5 h-2.5 text-white animate-in zoom-in duration-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={4}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className={`text-sm tracking-wide transition-colors duration-300 ${
                    step === s.id
                      ? "font-bold text-black"
                      : step > s.id
                        ? "font-semibold text-black"
                        : "font-medium text-gray-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-500 hover:text-black transition-colors"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <form
          className="flex flex-col max-w-3xl mx-auto w-full p-8 xl:p-16 flex-1 min-h-0"
          onSubmit={
            step === totalSteps
              ? handleSubmit
              : (e) => {
                  e.preventDefault();
                  handleNext();
                }
          }
        >
          <div className="flex-1 relative">
            <div className="md:hidden py-4 mb-6 border-b">
              <h1 className="text-2xl font-bold text-black border-b border-gray-100 pb-4">
                E-Academy
              </h1>
            </div>

            <div
              key={`wrapper-step-${step}`}
              className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out"
            >
              <h2 className="text-lg font-semibold mb-8 text-black border-b border-gray-100 pb-4 flex items-center gap-3">
                <span className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
                  {step}
                </span>
                {currentSteps.find((s) => s.id === step)?.label}
              </h2>

              {step === 1 && renderStep1()}
              {role === "STUDENT" && step === 2 && renderStep2Student()}
              {role === "STUDENT" && step === 3 && renderStep3Student()}
              {role === "STUDENT" && step === 4 && renderStepDocuments()}

              {role === "COACH" && step === 2 && renderStep2Coach()}
              {role === "COACH" && step === 3 && renderStepDocuments()}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-12 pt-6 pb-6 flex items-center justify-between border-t border-gray-100">
            <div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-6 py-2.5 rounded-full text-sm font-semibold text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-2.5 rounded-full text-sm font-semibold text-white transition-colors flex items-center gap-2 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black hover:bg-gray-900"
              }`}
            >
              {step === totalSteps
                ? loading
                  ? "Submitting..."
                  : "Complete Registration"
                : "Continue"}
              {!loading && step !== totalSteps && (
                <span className="text-lg">→</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Reusable Input Component Matching the clean style
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
    <label className="block text-xs font-semibold text-gray-700 mb-1.5 transition-colors group-focus-within:text-black">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full bg-[#f4f4f5] border border-transparent focus:border-gray-300 text-[14px] rounded-lg px-4 py-2.5 focus:outline-none focus:bg-white focus:ring-4 focus:ring-gray-100 transition-all duration-300 transform outline-none focus:-translate-y-0.5 hover:bg-gray-100 focus:shadow-sm font-medium text-black placeholder-gray-400"
      {...props}
    />
  </div>
);

// Reusable File Input Component Matching the clean style
const FileInput = ({ label, onChange, accept, required = false }: any) => (
  <div className="group">
    <label className="block text-xs font-semibold text-gray-700 mb-1.5 transition-colors group-focus-within:text-black">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type="file"
      onChange={onChange}
      accept={accept}
      required={required}
      className="w-full bg-[#f4f4f5] border border-dashed border-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all duration-300 transform outline-none hover:-translate-y-0.5 focus:-translate-y-0.5 hover:bg-gray-100 hover:border-gray-400 file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-[13px] file:font-semibold file:bg-gray-200 file:text-gray-800 hover:file:bg-gray-300 file:cursor-pointer p-2 cursor-pointer"
    />
  </div>
);
