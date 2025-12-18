
import React from 'react';
import { motion } from 'framer-motion';

const MagicLoading: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative w-48 h-48">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-2 border-dashed border-rose-500/30 rounded-full"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4 border-2 border-dashed border-rose-400/20 rounded-full"
        />
        
        {/* Floating Particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 1, 0], 
              scale: [0, 1.2, 0],
              y: [-20, -100],
              x: Math.sin(i) * 50
            }}
            transition={{ 
              duration: 2 + Math.random(), 
              repeat: Infinity, 
              delay: i * 0.4 
            }}
            className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-rose-400 rounded-full blur-[1px]"
          />
        ))}

        <div className="absolute inset-0 flex items-center justify-center">
          <i className="fas fa-magic text-4xl text-rose-500 animate-pulse"></i>
        </div>
      </div>
      
      <h2 className="mt-8 text-2xl font-serif text-white text-center">Restoring your memories...</h2>
      <p className="mt-2 text-zinc-400 text-sm max-w-xs text-center">
        Our AI is gently healing broken pixels and breathing life back into your photo.
      </p>
    </div>
  );
};

export default MagicLoading;
