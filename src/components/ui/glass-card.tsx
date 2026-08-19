import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "frosted" | "crystal" | "neon";
  hover?: boolean;
}

const glassVariants = {
  default: {
    initial: { 
      background: "rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.2)"
    },
    hover: {
      background: "rgba(255, 255, 255, 0.15)",
      backdropFilter: "blur(15px)",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      boxShadow: "0 8px 32px rgba(31, 38, 135, 0.37)"
    }
  },
  frosted: {
    initial: { 
      background: "rgba(255, 255, 255, 0.05)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255, 255, 255, 0.1)"
    },
    hover: {
      background: "rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(25px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      boxShadow: "0 8px 32px rgba(31, 38, 135, 0.37)"
    }
  },
  crystal: {
    initial: { 
      background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.18)"
    },
    hover: {
      background: "linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)",
      backdropFilter: "blur(15px)",
      border: "1px solid rgba(255, 255, 255, 0.25)",
      boxShadow: "0 8px 32px rgba(31, 38, 135, 0.37)"
    }
  },
  neon: {
    initial: { 
      background: "rgba(147, 51, 234, 0.1)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(147, 51, 234, 0.3)",
      boxShadow: "0 0 20px rgba(147, 51, 234, 0.3)"
    },
    hover: {
      background: "rgba(147, 51, 234, 0.15)",
      backdropFilter: "blur(15px)",
      border: "1px solid rgba(147, 51, 234, 0.5)",
      boxShadow: "0 0 30px rgba(147, 51, 234, 0.5)"
    }
  }
};

export function GlassCard({ 
  children, 
  className = "", 
  variant = "default", 
  hover = true 
}: GlassCardProps) {
  return (
    <motion.div
      className={`rounded-2xl ${className}`}
      style={glassVariants[variant].initial}
      whileHover={hover ? glassVariants[variant].hover : {}}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

// Glass Navigation Bar
export function GlassNavbar({ children }: { children: ReactNode }) {
  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div
        className="bg-white/10 backdrop-blur-md border-b border-white/20"
        style={{
          background: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)"
        }}
      >
        {children}
      </div>
    </motion.nav>
  );
}

// Animated Glass Modal
export function GlassModal({ 
  isOpen, 
  onClose, 
  children 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  children: ReactNode;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: isOpen ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      
      {/* Modal Content */}
      <motion.div
        className="relative z-10 w-full max-w-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <GlassCard variant="crystal" className="p-8">
          {children}
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

// Floating Glass Badge
export function GlassBadge({ 
  children, 
  className = "" 
}: { 
  children: ReactNode; 
  className?: string;
}) {
  return (
    <motion.div
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${className}`}
      style={{
        background: "rgba(255, 255, 255, 0.15)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.2)"
      }}
      whileHover={{
        background: "rgba(255, 255, 255, 0.25)",
        scale: 1.05
      }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

// Glass Stats Card
export function GlassStatsCard({ 
  title, 
  value, 
  change, 
  icon,
  trend = "up"
}: { 
  title: string; 
  value: string; 
  change: string; 
  icon: ReactNode;
  trend?: "up" | "down";
}) {
  return (
    <GlassCard variant="frosted" className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
          {icon}
        </div>
        <GlassBadge className={trend === "up" ? "text-green-400" : "text-red-400"}>
          {change}
        </GlassBadge>
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
      <p className="text-white/70 text-sm">{title}</p>
    </GlassCard>
  );
}
