import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function LoadingScreen({ isLoading }) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0D1117]"
        >
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "backOut", delay: 0.2 }}
            >
              <div className="relative w-24 h-24 mx-auto mb-6">
                 <motion.div 
                    className="absolute inset-0 border-2 border-cyan-400/20 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                 />
                 <motion.div 
                    className="absolute inset-2 border-2 border-cyan-400/30 rounded-full"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                 />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center shadow-lg border border-cyan-400/50">
                        <Sparkles className="w-8 h-8 text-cyan-400" />
                    </div>
                 </div>
              </div>

              <h1 className="text-3xl font-bold mb-2 text-white tracking-widest uppercase">
                BrandStreet
              </h1>
              <p className="text-cyan-400 text-lg mb-8">Intelligence Hub</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="mt-12"
            >
              <div className="relative w-64 h-1 bg-slate-700 rounded-full overflow-hidden mx-auto">
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-cyan-400"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
              </div>
              <p className="text-slate-400 mt-3 text-sm">Initializing dashboard...</p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}