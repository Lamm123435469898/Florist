import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02
  }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4
};

const slideVariants = {
  initial: {
    x: "100%",
    opacity: 0
  },
  in: {
    x: 0,
    opacity: 1
  },
  out: {
    x: "-100%",
    opacity: 0
  }
};

const fadeVariants = {
  initial: {
    opacity: 0
  },
  in: {
    opacity: 1
  },
  out: {
    opacity: 0
  }
};

const scaleVariants = {
  initial: {
    scale: 0.8,
    opacity: 0
  },
  in: {
    scale: 1,
    opacity: 1
  },
  out: {
    scale: 1.2,
    opacity: 0
  }
};

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Different transition types
export function SlideTransition({ children }: PageTransitionProps) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={slideVariants}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function FadeTransition({ children }: PageTransitionProps) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={fadeVariants}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function ScaleTransition({ children }: PageTransitionProps) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={scaleVariants}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Animated Route Container
export function AnimatedRoutes({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <PageTransition>
        {children}
      </PageTransition>
    </div>
  );
}

// Loading Bar Transition
export function LoadingBar({ isLoading }: { isLoading: boolean }) {
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-pink-600 z-50 origin-left"
      initial={{ scaleX: 0 }}
      animate={{ scaleX: isLoading ? 1 : 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    />
  );
}

// Animated Layout Component
export function AnimatedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <LoadingBar isLoading={false} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
