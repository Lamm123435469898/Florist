import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ReactNode, useState, useRef } from "react";

interface AnimatedButtonProps {
  children: ReactNode;
  variant?: "default" | "gradient" | "glow" | "neon";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
}

const buttonVariants = {
  default: {
    initial: { scale: 1, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" },
    hover: { 
      scale: 1.05, 
      boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.95 }
  },
  gradient: {
    initial: { 
      scale: 1, 
      background: "linear-gradient(45deg, #9333ea, #ec4899)",
      boxShadow: "0 4px 15px rgba(147, 51, 234, 0.3)"
    },
    hover: { 
      scale: 1.05,
      background: "linear-gradient(45deg, #a855f7, #f472b6)",
      boxShadow: "0 8px 25px rgba(147, 51, 234, 0.4)",
      transition: { duration: 0.3 }
    },
    tap: { scale: 0.95 }
  },
  glow: {
    initial: { 
      scale: 1,
      boxShadow: "0 0 20px rgba(147, 51, 234, 0.3)"
    },
    hover: { 
      scale: 1.05,
      boxShadow: "0 0 30px rgba(147, 51, 234, 0.6)",
      transition: { duration: 0.3 }
    },
    tap: { scale: 0.95 }
  },
  neon: {
    initial: { 
      scale: 1,
      boxShadow: "0 0 10px #9333ea, 0 0 20px #9333ea, 0 0 30px #9333ea"
    },
    hover: { 
      scale: 1.05,
      boxShadow: "0 0 20px #9333ea, 0 0 30px #9333ea, 0 0 40px #9333ea",
      transition: { duration: 0.3 }
    },
    tap: { scale: 0.95 }
  }
};

const rippleVariants = {
  initial: { scale: 0, opacity: 1 },
  animate: { 
    scale: 4, 
    opacity: 0,
    transition: { duration: 0.6 }
  }
};

export function AnimatedButton({ 
  children, 
  variant = "default", 
  size = "md", 
  className = "",
  onClick,
  disabled = false
}: AnimatedButtonProps) {
  const [ripples, setRipples] = useState<Array<{ id: number, x: number, y: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = { id: Date.now(), x, y };
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
    
    onClick?.();
  };

  const getVariantClasses = () => {
    switch (variant) {
      case "gradient":
        return "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0";
      case "glow":
        return "bg-purple-600 text-white border-purple-400";
      case "neon":
        return "bg-purple-900 text-purple-100 border-purple-500";
      default:
        return "";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "px-4 py-2 text-sm";
      case "lg":
        return "px-8 py-4 text-lg";
      default:
        return "px-6 py-3";
    }
  };

  return (
    <motion.div
      variants={buttonVariants[variant]}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      className="relative inline-block"
    >
      <Button
        className={`${getVariantClasses()} ${getSizeClasses()} ${className} relative overflow-hidden rounded-full font-semibold transition-all duration-300`}
        onClick={handleClick}
        disabled={disabled}
      >
        {/* Ripple Effects */}
        {ripples.map(ripple => (
          <motion.span
            key={ripple.id}
            className="absolute bg-white/30 rounded-full pointer-events-none"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20,
            }}
            variants={rippleVariants}
            initial="initial"
            animate="animate"
          />
        ))}
        
        {/* Button Content */}
        <span className="relative z-10">{children}</span>
        
        {/* Shimmer Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.6 }}
        />
      </Button>
    </motion.div>
  );
}

// Floating Action Button
export function FloatingActionButton({ 
  children, 
  onClick,
  className = ""
}: { 
  children: ReactNode; 
  onClick?: () => void;
  className?: string;
}) {
  return (
    <motion.button
      className={`fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full p-4 shadow-lg ${className}`}
      whileHover={{ 
        scale: 1.1,
        boxShadow: "0 10px 30px rgba(147, 51, 234, 0.4)"
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {children}
      </motion.div>
    </motion.button>
  );
}

// Magnetic Button
export function MagneticButton({ 
  children, 
  onClick,
  className = ""
}: { 
  children: ReactNode; 
  onClick?: () => void;
  className?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const x = (e.clientX - centerX) / 10;
    const y = (e.clientY - centerY) / 10;
    
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      className={`bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg ${className}`}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}
