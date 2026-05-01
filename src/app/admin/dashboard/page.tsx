/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { logout } from "@/store/slices/authSlice";
import { api } from "@/lib/axios";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewRole, setViewRole] = useState<"STUDENT" | "COACH">("STUDENT");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [updatingStatus, setUpdatingStatus] = useState<"APPROVED" | "REJECTED" | null>(null);

  useEffect(() => {
    if (!auth.isLoading) {
      if (!auth.isAuthenticated) router.push("/login");
      else if (auth.user?.role !== "ADMIN")
        router.push(`/${auth.user?.role.toLowerCase()}/dashboard`);
    }
  }, [auth, router]);

  useEffect(() => {
    if (auth.isAuthenticated && auth.user?.role === "ADMIN") {
      fetchUsers();
    }
  }, [auth, viewRole]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/users?role=${viewRole}`);
      setUsers(response.data);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    id: string,
    status: "APPROVED" | "REJECTED",
  ) => {
    setUpdatingStatus(status);
    try {
      await api.patch(`/admin/users/${id}/status`, { status });
      toast.success(`User marked as ${status}`);
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, status } : u)),
      );
      if (selectedUser && selectedUser._id === id) {
        setSelectedUser({ ...selectedUser, status });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleExport = async (type: string) => {
    try {
      const response = await api.get(`/admin/export?type=${type}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${type}-${new Date().getTime()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Download started");
    } catch {
      toast.error("Export failed");
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.log("Backend logout unsupported or failed", err);
    } finally {
      localStorage.removeItem("user");
      dispatch(logout());
      router.push("/login");
    }
  };

  if (
    auth.isLoading ||
    !auth.isAuthenticated ||
    auth.user?.role !== "ADMIN"
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50 text-blue-400 font-sans">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f7] font-sans text-gray-800 pb-12">

      {/* ── Top Navigation ── */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center font-extrabold rounded-lg text-sm shadow">
            SA
          </div>
          <span className="font-extrabold text-xl tracking-tight hidden sm:block text-gray-900">
            Academy Admin
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              handleExport(
                viewRole === "STUDENT" ? "all-students" : "all-coaches",
              )
            }
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">

        {/* ── Header & Tabs ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-gray-900">
              Applicants Directory
            </h1>
            <p className="text-sm text-gray-500">
              Review registrations, manage approvals, and track academy members.
            </p>
          </div>

          <div className="flex p-1 bg-white rounded-xl self-start sm:self-auto border border-gray-200 shadow-sm">
            <button
              onClick={() => setViewRole("STUDENT")}
              className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all ${
                viewRole === "STUDENT"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-blue-600"
              }`}
            >
              Athletes
            </button>
            <button
              onClick={() => setViewRole("COACH")}
              className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all ${
                viewRole === "COACH"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-blue-600"
              }`}
            >
              Coaches
            </button>
          </div>
        </div>

        {/* ── Data Table Card ── */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-blue-50 border-b border-blue-100 text-xs text-blue-700 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-4">Applicant Profile</th>
                  <th className="px-6 py-4">Contact Info</th>
                  {viewRole === "STUDENT" && <th className="px-6 py-4">Age / DOB</th>}
                  <th className="px-6 py-4">
                    {viewRole === "STUDENT" ? "Competition" : "Experience"}
                  </th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      Loading records...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400 font-medium">
                      No {viewRole.toLowerCase()}s found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{user.name}</div>
                        <div className="text-gray-400 text-xs mt-0.5">{user.sport}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900">{user.phone}</div>
                        <div className="text-gray-400 text-xs mt-0.5">{user.email}</div>
                      </td>
                      {viewRole === "STUDENT" && (
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {user.age || "-"}
                        </td>
                      )}
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {viewRole === "STUDENT"
                          ? user.competitionAppliedFor || "-"
                          : `${user.experience || 0} years`}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                            user.status === "PENDING"
                              ? "bg-orange-50 text-orange-700 border-orange-200"
                              : user.status === "APPROVED"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-1.5 rounded-lg transition-colors"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Full Profile Modal ── */}
        {selectedUser && (
          // Backdrop — clicking it closes the modal
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedUser(null)}
          >
            {/* Card — stop propagation so clicks inside don't close it */}
            <div
              className="bg-white w-full max-w-3xl rounded-2xl shadow-xl relative flex flex-col max-h-[90vh] overflow-hidden border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-blue-50">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedUser.name}&apos;s Application
                  </h2>
                  <p className="text-xs text-gray-500 font-semibold mt-1">
                    Submitted{" "}
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300 transition-colors"
                >
                  &times;
                </button>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto p-6 lg:p-8 space-y-8 flex-1">
                {/* Status Box */}
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    selectedUser.status === "PENDING"
                      ? "bg-orange-50 border-orange-100"
                      : selectedUser.status === "APPROVED"
                      ? "bg-green-50 border-green-100"
                      : "bg-red-50 border-red-100"
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">
                      Current Status
                    </p>
                    <p
                      className={`text-lg font-bold ${
                        selectedUser.status === "PENDING"
                          ? "text-orange-700"
                          : selectedUser.status === "APPROVED"
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {selectedUser.status}
                    </p>
                  </div>
                  {selectedUser.status === "PENDING" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleUpdateStatus(selectedUser._id, "REJECTED")
                        }
                        disabled={updatingStatus !== null}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-white border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
                      >
                        {updatingStatus === "REJECTED" ? (
                          <span className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                          "Reject"
                        )}
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateStatus(selectedUser._id, "APPROVED")
                        }
                        disabled={updatingStatus !== null}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[90px]"
                      >
                        {updatingStatus === "APPROVED" ? (
                          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                          "Approve"
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Grid Data */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-1">Email</p>
                    <p className="font-medium text-gray-900">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-1">Mobile Phone</p>
                    <p className="font-medium text-gray-900">{selectedUser.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-1">Primary Sport</p>
                    <p className="font-medium text-gray-900">{selectedUser.sport}</p>
                  </div>

                  {selectedUser.role === "STUDENT" && (
                    <>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold mb-1">Date of Birth (Age)</p>
                        <p className="font-medium text-gray-900">
                          {new Date(selectedUser.dob).toLocaleDateString()} ({selectedUser.age}y)
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold mb-1">Gender</p>
                        <p className="font-medium text-gray-900">{selectedUser.gender}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold mb-1">Blood Group</p>
                        <p className="font-medium text-gray-900">{selectedUser.bloodGroup || "N/A"}</p>
                      </div>

                      <div className="sm:col-span-2 pt-4 border-t border-gray-100">
                        <h4 className="font-bold text-base text-gray-900">Guardian & Address</h4>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold mb-1">Guardian Name</p>
                        <p className="font-medium text-gray-900">
                          {selectedUser.guardianName} ({selectedUser.guardianRelationship})
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold mb-1">Guardian Phone</p>
                        <p className="font-medium text-gray-900">{selectedUser.guardianPhone}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="text-xs text-gray-500 font-semibold mb-1">Full Address</p>
                        <p className="font-medium text-gray-900">
                          {selectedUser.address?.street}, {selectedUser.address?.city},{" "}
                          {selectedUser.address?.state}, {selectedUser.address?.pincode}
                        </p>
                      </div>

                      <div className="sm:col-span-2 pt-4 border-t border-gray-100">
                        <h4 className="font-bold text-base text-gray-900">Competition Details</h4>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold mb-1">Current Club</p>
                        <p className="font-medium text-gray-900">{selectedUser.currentClub || "None"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold mb-1">State Representing</p>
                        <p className="font-medium text-gray-900">{selectedUser.stateRepresenting || "None"}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="text-xs text-gray-500 font-semibold mb-1">Competition Applied For</p>
                        <p className="font-medium text-gray-900">{selectedUser.competitionAppliedFor}</p>
                      </div>
                    </>
                  )}

                  {selectedUser.role === "COACH" && (
                    <div>
                      <p className="text-xs text-gray-500 font-semibold mb-1">Years of Experience</p>
                      <p className="font-medium text-gray-900">{selectedUser.experience || 0} years</p>
                    </div>
                  )}
                </div>

                {/* Documents Section */}
                <div className="pt-6 border-t border-gray-100">
                  <h4 className="font-bold text-base mb-4 text-gray-900">Uploaded Documents</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedUser.profilePhotoUrl && (
                      <DocumentCard label="Profile Photo" url={selectedUser.profilePhotoUrl} />
                    )}
                    {selectedUser.idProofUrl && (
                      <DocumentCard label="ID Proof" url={selectedUser.idProofUrl} />
                    )}
                    {selectedUser.addressProofUrl && (
                      <DocumentCard label="Address Proof" url={selectedUser.addressProofUrl} />
                    )}
                    {selectedUser.medicalCertificateUrl && (
                      <DocumentCard label="Medical Cert" url={selectedUser.medicalCertificateUrl} />
                    )}
                    {selectedUser.certificationUrl && (
                      <DocumentCard label="Certification" url={selectedUser.certificationUrl} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const DocumentCard = ({ label, url }: { label: string; url: string }) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="group flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all text-center"
  >
    <svg
      className="w-8 h-8 text-blue-400 mb-2 group-hover:text-blue-600 transition-colors"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
      />
    </svg>
    <span className="text-xs font-semibold text-gray-600 group-hover:text-blue-700">
      {label}
    </span>
  </a>
);
