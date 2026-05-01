"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { logout } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";

export default function Navbar() {
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  if (!auth.isAuthenticated || !auth.user) {
    return null; // Don't show navbar on public pages like login/register
  }

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.log("Logout failed", err);
    } finally {
      localStorage.removeItem("user");
      dispatch(logout());
      router.push("/login");
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center font-extrabold rounded-lg text-sm shadow">
          SA
        </div>
        <span className="font-extrabold text-xl tracking-tight hidden sm:block text-gray-900">
          Sports Academy
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col text-right mr-2">
          <span className="text-sm font-bold text-gray-900">{auth.user.name}</span>
          <span className="text-xs text-gray-500 font-medium capitalize">{auth.user.role.toLowerCase()}</span>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}
