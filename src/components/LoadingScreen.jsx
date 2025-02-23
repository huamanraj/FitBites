import { motion } from 'framer-motion';
import logo from '../assets/logo.png';

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.img
          src={logo}
          alt="FitBites Logo"
          className="w-45  mx-auto mb-8"
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [1, 0.8, 1] 
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce"></div>
        </div>
      </motion.div>
    </div>
  );
} 