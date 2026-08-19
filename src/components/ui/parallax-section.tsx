import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface ParallaxSectionProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}

export function ParallaxSection({ children, className = "", speed = 0.5 }: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, speed * 100]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <motion.div style={{ y }} className="relative">
        {children}
      </motion.div>
    </div>
  );
}

export function ParallaxBackground() {
  const { scrollY } = useScroll();
  
  const y1 = useTransform(scrollY, [0, 1000], [0, -150]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -300]);
  const y3 = useTransform(scrollY, [0, 1000], [0, -450]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Layer 1 - Slowest */}
      <motion.div
        style={{ y: y1 }}
        className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl"
      />
      <motion.div
        style={{ y: y1 }}
        className="absolute top-40 right-20 w-48 h-48 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"
      />
      
      {/* Layer 2 - Medium */}
      <motion.div
        style={{ y: y2 }}
        className="absolute top-60 left-1/4 w-24 h-24 bg-gradient-to-br from-orange-400/20 to-yellow-400/20 rounded-full blur-xl"
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute top-80 right-1/3 w-36 h-36 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-2xl"
      />
      
      {/* Layer 3 - Fastest */}
      <motion.div
        style={{ y: y3 }}
        className="absolute top-96 left-1/2 w-20 h-20 bg-gradient-to-br from-red-400/20 to-rose-400/20 rounded-full blur-lg"
      />
      <motion.div
        style={{ y: y3 }}
        className="absolute top-1/2 right-1/4 w-28 h-28 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-xl"
      />
    </div>
  );
}
