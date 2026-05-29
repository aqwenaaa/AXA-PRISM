"use client";

import { motion, AnimatePresence } from "motion/react";
import { LogOut, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 text-center"
          >
            {/* PERBAIKAN 2: Mengubah rounded-2xl menjadi rounded-full (lingkaran) dan warna bg ke ungu muda */}
            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-purple-100">
              <AlertCircle className="text-[#8B5CF6]" size={32} />
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">Ready to Leave?</h3>
            <p className="text-slate-500 mb-8 text-sm">
              Are you sure you want to log out? You will need to login again to access your dashboard.
            </p>

            <div className="flex flex-col gap-3">
              {/* PERBAIKAN 1: Mengubah warna tombol merah ke warna ungu brand AXA-PRISM */}
              <Button 
                onClick={onConfirm}
                className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white py-6 rounded-xl font-bold shadow-lg shadow-purple-200 transition-all active:scale-95"
              >
                <LogOut className="mr-2 w-5 h-5" />
                Yes, Log Me Out
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={onClose}
                className="w-full py-6 text-slate-500 hover:bg-slate-50 rounded-xl font-medium"
              >
                Stay Logged In
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}