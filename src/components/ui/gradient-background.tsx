import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GradientBackgroundProps {
  children: ReactNode;
  variant?: "aurora" | "sunset" | "ocean" | "cosmic" | "neon";
  className?: string;
}

const gradientVariants = {
  aurora: {
    initial: { backgroundPosition: "0% 50%" },
    animate: {
      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      transition: {
        duration: 15,
        repeat: Infinity,
        ease: "linear"
      }
    }
  },
  sunset: {
    initial: { backgroundPosition: "0% 0%" },
    animate: {
      backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
      transition: {
        duration: 20,
        repeat: Infinity,
        ease: "linear"
      }
    }
  },
  ocean: {
    initial: { backgroundPosition: "0% 0%" },
    animate: {
      backgroundPosition: ["0% 0%", "50% 100%", "100% 0%", "0% 0%"],
      transition: {
        duration: 25,
        repeat: Infinity,
        ease: "linear"
      }
    }
  },
  cosmic: {
    initial: { backgroundPosition: "0% 50%" },
    animate: {
      backgroundPosition: ["0% 50%", "100% 50%", "50% 0%", "0% 50%"],
      transition: {
        duration: 30,
        repeat: Infinity,
        ease: "linear"
      }
    }
  },
  neon: {
    initial: { backgroundPosition: "0% 50%" },
    animate: {
      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "linear"
      }
    }
  }
};

const getGradientClass = (variant: string) => {
  switch (variant) {
    case "aurora":
      return "bg-gradient-to-br from-green-400 via-blue-500 to-purple-600";
    case "sunset":
      return "bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600";
    case "ocean":
      return "bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-600";
    case "cosmic":
      return "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400";
    case "neon":
      return "bg-gradient-to-br from-purple-600 via-blue-500 to-green-400";
    default:
      return "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400";
  }
};

export function GradientBackground({ 
  children, 
  variant = "cosmic", 
  className = "" 
}: GradientBackgroundProps) {
  return (
    <div className={`relative min-h-screen ${className}`}>
      {/* Animated Gradient Background */}
      <motion.div
        className={`absolute inset-0 ${getGradientClass(variant)}`}
        variants={gradientVariants[variant]}
        initial="initial"
        animate="animate"
        style={{
          backgroundSize: "400% 400%"
        }}
      />
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// Floating Gradient Orbs
export function GradientOrbs() {
  const orbVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.6, 0.3],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <motion.div
        className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-3xl"
        variants={orbVariants}
        initial="initial"
        animate="animate"
      />
      <motion.div
        className="absolute top-1/2 right-20 w-80 h-80 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl"
        variants={orbVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 1 }}
      />
      <motion.div
        className="absolute bottom-20 left-1/3 w-72 h-72 bg-gradient-to-br from-orange-500/30 to-yellow-500/30 rounded-full blur-3xl"
        variants={orbVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 2 }}
      />
    </div>
  );
}

// Animated Section Background
export function AnimatedSection({ 
  children, 
  gradient = "from-purple-600/10 to-pink-600/10",
  className = ""
}: { 
  children: ReactNode; 
  gradient?: string;
  className?: string;
}) {
  return (
    <motion.section
      className={`relative overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      {/* Animated Background */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${gradient}`}
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          backgroundSize: "200% 200%"
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.section>
  );
}

// Pulse Gradient Background
export function PulseGradient({ 
  children, 
  className = "" 
}: { 
  children: ReactNode; 
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 opacity-80"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.8, 0.6, 0.8]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
