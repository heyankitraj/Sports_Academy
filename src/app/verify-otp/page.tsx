'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/axios';
import toast from 'react-hot-toast';

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      toast.success(response.data.message || 'Verified successfully!');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4 sm:space-y-5">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1 ml-1">Email Address</label>
          <input
            type="email"
            required
            readOnly={!!searchParams.get('email')}
            className={`block w-full px-3 py-2 sm:px-4 sm:py-3 neu-pressed rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 border-none bg-transparent text-sm sm:text-sm ${searchParams.get('email') ? 'opacity-70 cursor-not-allowed' : ''}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1 ml-1">6-Digit OTP</label>
          <input
            type="text"
            required
            maxLength={6}
            placeholder="123456"
            className="block w-full px-3 py-2 sm:px-4 sm:py-3 neu-pressed rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 border-none bg-transparent text-center text-xl sm:text-2xl tracking-[0.3em] sm:tracking-[0.5em] font-mono"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          />
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full flex justify-center py-2 sm:py-3 px-4 neu-button rounded-xl text-sm font-bold text-blue-600 hover:text-blue-700 focus:outline-none disabled:opacity-50 transition-all duration-200"
        >
          {loading ? 'Verifying...' : 'Verify Account'}
        </button>
      </div>
    </form>
  );
}

export default function VerifyOtpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center neu-bg py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8 neu-flat p-5 sm:p-8 rounded-3xl">
        <div>
          <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-gray-700">
            Verify Your Email
          </h2>
          <p className="mt-2 sm:mt-4 text-center text-xs sm:text-sm text-gray-500">
            We've sent a 6-digit OTP to your email address.
          </p>
        </div>

        <Suspense fallback={<div className="text-center py-4 text-gray-500">Loading form...</div>}>
          <VerifyOtpForm />
        </Suspense>
      </div>
    </div>
  );
}