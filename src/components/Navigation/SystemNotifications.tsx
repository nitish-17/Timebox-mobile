import React, { useEffect } from 'react';
import { Shield, Star, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SystemMessage } from '../../types';

interface SystemNotificationsProps {
  messages: SystemMessage[];
  onDismiss: (id: string) => void;
}

export const SystemNotifications: React.FC<SystemNotificationsProps> = ({ 
  messages, 
  onDismiss 
}) => {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] flex flex-col gap-3 w-[90%] max-w-[400px] pointer-events-none">
      <AnimatePresence>
        {messages.map((msg) => (
          <NotificationItem 
            key={msg.id} 
            message={msg} 
            onDismiss={() => onDismiss(msg.id)} 
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

const NotificationItem: React.FC<{ message: SystemMessage; onDismiss: () => void }> = ({ message, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const getIcon = () => {
    switch (message.type) {
      case 'LEVEL_UP': return <Star className="text-amber-400 drop-shadow-[0_0_8px_#fbbf24]" size={24} />;
      case 'SKILL_AWAKENED': return <Zap className="text-sky-400 drop-shadow-[0_0_8px_#38bdf8]" size={24} />;
      default: return <Shield className="text-sky-400 drop-shadow-[0_0_8px_#38bdf8]" size={24} />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      onClick={onDismiss}
      className="pointer-events-auto cursor-pointer bg-slate-950/90 backdrop-blur-xl border border-sky-500/50 p-4 rounded-xl shadow-[0_0_30px_rgba(14,165,233,0.3)] flex items-center gap-4 relative overflow-hidden"
    >
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-sky-500/5 animate-pulse" />
      
      <div className="flex-shrink-0">
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="text-sky-400 font-black text-xs uppercase tracking-[0.2em] mb-0.5">
          {message.title}
        </div>
        <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wider truncate">
          {message.description}
        </div>
      </div>

      {/* Decorative scanline effect */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-sky-500/[0.03] to-transparent h-[2px] w-full top-0 animate-[scanline_2s_linear_infinite]" />
    </motion.div>
  );
};
