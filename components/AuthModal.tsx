
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setStep('otp');
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    if (newOtp.every(v => v !== '') && index === 5) {
      setTimeout(() => onSuccess(email), 500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 overflow-hidden shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors">
          <i className="fas fa-times text-xl"></i>
        </button>

        <div className="mb-8">
          <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center mb-4">
            <i className="fas fa-user-lock text-white text-xl"></i>
          </div>
          <h2 className="text-2xl font-serif text-white">
            {step === 'email' ? 'Unlock Full Access' : 'Check your inbox'}
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            {step === 'email' 
              ? 'Enter your email to save your restorations and download high-res files.' 
              : `We sent a code to ${email}`}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'email' ? (
            <motion.form 
              key="email"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleEmailSubmit}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button className="w-full py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-all">
                Continue
              </button>
            </motion.form>
          ) : (
            <motion.div 
              key="otp"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="flex justify-between gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    className="w-12 h-14 bg-zinc-800 border border-zinc-700 rounded-xl text-center text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                  />
                ))}
              </div>
              <p className="text-center text-zinc-500 text-xs">
                Didn't receive it? <button onClick={() => setStep('email')} className="text-rose-500 hover:underline">Resend code</button>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 pt-6 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-500 uppercase tracking-widest">
          <span>Encrypted</span>
          <span>Terms & Privacy</span>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthModal;
