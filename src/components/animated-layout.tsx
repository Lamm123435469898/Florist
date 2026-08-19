import { motion } from "framer-motion";
import { ReactNode } from "react";
import { AnimatedNavbar } from "./animated-navbar";
import { AnimatedFooter } from "./animated-footer";
import { GradientOrbs } from "./ui/gradient-background";

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.6, -0.05, 0.01, 0.99]
    }
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02,
    transition: {
      duration: 0.3
    }
  }
};

interface AnimatedLayoutProps {
  children: ReactNode;
  showGradient?: boolean;
  showFooter?: boolean;
}

export function AnimatedLayout({ 
  children, 
  showGradient = true,
  showFooter = true 
}: AnimatedLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Animated Navbar */}
      <AnimatedNavbar />
      
      {/* Gradient Background Effects */}
      {showGradient && <GradientOrbs />}
      
      {/* Main Content with Animation */}
      <motion.main
        className="flex-1 relative"
        variants={pageVariants}
        initial="initial"
        animate="in"
        exit="out"
      >
        {/* Add padding for fixed navbar */}
        <div className="pt-32">
          {children}
        </div>
      </motion.main>
      
      {/* Animated Footer */}
      {showFooter && <AnimatedFooter />}
    </div>
  );
}

// Page transition wrapper for individual pages
export function AnimatedPage({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] }}
    >
      {children}
    </motion.div>
  );
}

// Section animation wrapper
export function AnimatedSection({ 
  children, 
  className = "",
  delay = 0 
}: { 
  children: ReactNode; 
  className?: string;
  delay?: number;
}) {
  return (
    <motion.section
      className={className}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ 
        duration: 0.8, 
        delay,
        ease: [0.6, -0.05, 0.01, 0.99]
      }}
    >
      {children}
    </motion.section>
  );
}

// Text reveal animation
export function TextReveal({ 
  children, 
  className = "" 
}: { 
  children: string; 
  className?: string;
}) {
  const words = children.split(" ");
  
  return (
    <span className={className}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          className="inline-block mr-2"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.5,
            delay: index * 0.1,
            ease: [0.6, -0.05, 0.01, 0.99]
          }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

// Stagger children animation
export function StaggerContainer({ 
  children, 
  className = "",
  staggerDelay = 0.1
}: { 
  children: ReactNode; 
  className?: string;
  staggerDelay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ 
  children, 
  className = "" 
}: { 
  children: ReactNode; 
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: {
            duration: 0.5,
            ease: [0.6, -0.05, 0.01, 0.99]
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
}

// Hover scale animation wrapper
export function HoverScale({ 
  children, 
  className = "",
  scale = 1.05
}: { 
  children: ReactNode; 
  className?: string;
  scale?: number;
}) {
  return (
    <motion.div
      className={className}
      whileHover={{ scale }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.div>
  );
}

// Glass card with animation
export function AnimatedGlassCard({ 
  children, 
  className = "" 
}: { 
  children: ReactNode; 
  className?: string;
}) {
  return (
    <motion.div
      className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ 
        background: "rgba(255, 255, 255, 0.15)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
      }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
