"use client";

import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const ChangePassword = () => {
  const router = useRouter();

  // 1. Pisahkan state untuk masing-masing field agar tidak bertabrakan
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulasi logika simpan di sini
    console.log("Password updated successfully");

    // 4. Berpindah ke page profile setelah klik Save Changes
    router.push('/profile'); 
  };

  return (
    <div className="min-h-screen bg-[#F8F9FE] p-6 lg:p-10">
      <button 
          onClick={() => router.push('/profile')}
        className="flex items-center gap-2 text-slate-500 hover:text-[#8B5CF6] mb-8 transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to Profile</span>
      </button>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#F5F3FF] rounded-2xl flex items-center justify-center text-[#8B5CF6]">
                <Lock size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Change Password</h1>
                <p className="text-sm text-slate-500">Update your login credentials to keep your account secure.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Current Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Current Password</label>
              <div className="relative">
                <input 
                  type={showCurrent ? "text" : "password"}
                  className="w-full px-4 py-3 rounded-xl bg-[#F8F9FE] border border-slate-200 focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 outline-none transition-all"
                  placeholder="Enter current password"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#8B5CF6]"
                >
                  {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* New Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">New Password</label>
                <div className="relative">
                  <input 
                    type={showNew ? "text" : "password"}
                    className="w-full px-4 py-3 rounded-xl bg-[#F8F9FE] border border-slate-200 focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 outline-none transition-all"
                    placeholder="Min. 8 characters"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#8B5CF6]"
                  >
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Confirm New Password</label>
                <div className="relative">
                  <input 
                    type={showConfirm ? "text" : "password"}
                    className="w-full px-4 py-3 rounded-xl bg-[#F8F9FE] border border-slate-200 focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 outline-none transition-all"
                    placeholder="Repeat new password"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#8B5CF6]"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-4">
              <button 
                type="button"
                onClick={() => router.push('/profile')}
                className="px-6 py-2.5 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-8 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold shadow-lg shadow-purple-200 transition-all active:scale-95"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;