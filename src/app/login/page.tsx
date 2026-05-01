/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '@/store/slices/authSlice';
import { api } from '@/lib/axios';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/login', formData);
      const { user, message } = response.data;
      
      localStorage.setItem('user', JSON.stringify(user));
      dispatch(loginSuccess(user));
      toast.success(message || 'Logged in successfully!');
      
      // Redirect based on role
      if (user.role === 'ADMIN') router.push('/admin/dashboard');
      else if (user.role === 'COACH') router.push('/coach/dashboard');
      else router.push('/student/dashboard');
      
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white text-black font-sans">
      
      {/* Left Sidebar */}
      <div className="hidden md:flex w-[280px] lg:w-[320px] bg-[#fafafa] border-r border-gray-200 flex-col p-8 justify-between">
        
        <div>
          {/* Brand / Logo */}
          <div className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold italic rounded">E</div>
            <span className="font-extrabold text-xl tracking-tight">Academy</span>
          </div>

          <h1 className="text-2xl font-bold mb-2 text-black">Welcome Back</h1>
          <p className="text-sm text-gray-500 leading-relaxed mb-10">
            Sign in to access your dashboard, track your progress, and manage your activities.
          </p>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
           <Link href="/register" className="text-sm font-medium text-gray-500 hover:text-black transition-colors">
            Don't have an account? Register
           </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        <form className="flex-1 flex flex-col max-w-md mx-auto w-full p-8 md:p-12 lg:p-16 justify-center min-h-0" onSubmit={handleSubmit}>
          
          <div className="md:hidden py-4 mb-6 border-b border-gray-100 flex items-center gap-2">
            <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold italic rounded">E</div>
            <h1 className="text-2xl font-bold text-black border-b border-transparent">E-Academy</h1>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out space-y-6">
            <h2 className="text-2xl font-semibold mb-8 text-black border-b border-gray-100 pb-4">
              Sign In
            </h2>

            <div className="space-y-5">
              <InputField 
                label="Email Address" 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={(e: any) => setFormData({ ...formData, email: e.target.value })} 
                required 
              />
              <InputField 
                label="Password" 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={(e: any) => setFormData({ ...formData, password: e.target.value })} 
                required 
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-full text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2 ${
                  loading ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-900"
                }`}
              >
                {loading ? 'Signing in...' : 'Sign In'}
                {!loading && <span className="text-lg">→</span>}
              </button>
            </div>
            
            <div className="md:hidden text-center mt-6 pt-6 border-t border-gray-100">
               <Link href="/register" className="text-sm font-medium text-gray-500 hover:text-black transition-colors">
                Don't have an account? Register
               </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// Reusable Input Component Matching the clean style
const InputField = ({ label, type = "text", name, value, onChange, required = false, className="", ...props }: any) => (
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
      className="w-full bg-[#f4f4f5] border border-transparent focus:border-gray-300 text-[14px] rounded-lg px-4 py-3 focus:outline-none focus:bg-white focus:ring-4 focus:ring-gray-100 transition-all duration-300 transform outline-none focus:-translate-y-0.5 hover:bg-gray-100 focus:shadow-sm font-medium text-black placeholder-gray-400" 
      {...props} 
    />
  </div>
);
