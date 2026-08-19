import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const FlowerLine = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (window.scrollY / windowHeight) * 100;
      setScrollProgress(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Tính toán position cho icon hoa dày theo scroll
  const flowerPosition = scrollProgress;

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 2000"
        preserveAspectRatio="none"
      >
        {/* Gradient definition */}
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fce7f3" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#f9a8d4" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#fce7f3" stopOpacity="0.3" />
          </linearGradient>
          
          {/* Filter for glow effect */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Flower icon as reusable symbol */}
          <symbol id="flowerIcon" viewBox="0 0 40 40">
            <g transform="translate(20,20)">
              {/* Hoa 5 cánh */}
              <circle cx="0" cy="-8" r="6" fill="#f9a8d4" opacity="0.8"/>
              <circle cx="7.6" cy="-2.5" r="6" fill="#fbcfe8" opacity="0.8"/>
              <circle cx="4.7" cy="6.5" r="6" fill="#f9a8d4" opacity="0.8"/>
              <circle cx="-4.7" cy="6.5" r="6" fill="#fbcfe8" opacity="0.8"/>
              <circle cx="-7.6" cy="-2.5" r="6" fill="#f9a8d4" opacity="0.8"/>
              {/* Nhãn hoa */}
              <circle cx="0" cy="0" r="4" fill="#fbbf24" opacity="0.9"/>
            </g>
          </symbol>
        </defs>

        {/* Main curved path */}
        <path
          d="M 100 0 
               Q 200 200, 150 400
               T 250 800
               Q 300 1000, 200 1200
               T 300 1600
               Q 350 1800, 250 2000"
          stroke="url(#lineGradient)"
          strokeWidth="3"
          fill="none"
          filter="url(#glow)"
          opacity="0.8"
        />

        {/* Secondary decorative path */}
        <path
          d="M 1100 0 
               Q 1000 200, 1050 400
               T 950 800
               Q 900 1000, 1000 1200
               T 900 1600
               Q 850 1800, 950 2000"
          stroke="url(#lineGradient)"
          strokeWidth="2"
          fill="none"
          filter="url(#glow)"
          opacity="0.5"
        />

        {/* Animated flowers along the path */}
        <motion.g
          animate={{
            motionPath: {
              path: "M 100 0 Q 200 200, 150 400 T 250 800 Q 300 1000, 200 1200 T 300 1600 Q 350 1800, 250 2000",
              align: "center",
              autoRotate: true
            }
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <use href="#flowerIcon" width="30" height="30" x="-15" y="-15" />
        </motion.g>

        {/* Second animated flower */}
        <motion.g
          animate={{
            motionPath: {
              path: "M 1100 0 Q 1000 200, 1050 400 T 950 800 Q 900 1000, 1000 1200 T 900 1600 Q 850 1800, 950 2000",
              align: "center",
              autoRotate: true
            }
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear",
            delay: 2
          }}
        >
          <use href="#flowerIcon" width="25" height="25" x="-12.5" y="-12.5" />
        </motion.g>

        {/* Third animated flower */}
        <motion.g
          animate={{
            motionPath: {
              path: "M 100 0 Q 200 200, 150 400 T 250 800 Q 300 1000, 200 1200 T 300 1600 Q 350 1800, 250 2000",
              align: "center",
              autoRotate: true
            }
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
            delay: 4
          }}
        >
          <use href="#flowerIcon" width="20" height="20" x="-10" y="-10" />
        </motion.g>

        {/* Scroll-based flower */}
        <motion.g
          animate={{
            motionPath: {
              path: "M 100 0 Q 200 200, 150 400 T 250 800 Q 300 1000, 200 1200 T 300 1600 Q 350 1800, 250 2000",
              align: "center",
              autoRotate: true
            }
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
            delay: 6
          }}
        >
          <use href="#flowerIcon" width="35" height="35" x="-17.5" y="-17.5" />
        </motion.g>

        {/* Decorative dots along the path */}
        {[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((progress, index) => (
          <motion.circle
            key={`dot-${index}`}
            r="2"
            fill="#f9a8d4"
            opacity="0.6"
            animate={{
              motionPath: {
                path: "M 100 0 Q 200 200, 150 400 T 250 800 Q 300 1000, 200 1200 T 300 1600 Q 350 1800, 250 2000",
                align: "center"
              },
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.3
            }}
          />
        ))}

        {/* Central decorative elements */}
        <motion.g
          transform="translate(600, 1000)"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <circle cx="0" cy="0" r="8" fill="#fce7f3" opacity="0.4"/>
          <circle cx="30" cy="0" r="6" fill="#fbcfe8" opacity="0.3"/>
          <circle cx="-30" cy="0" r="6" fill="#fbcfe8" opacity="0.3"/>
          <circle cx="0" cy="30" r="6" fill="#f9a8d4" opacity="0.3"/>
          <circle cx="0" cy="-30" r="6" fill="#f9a8d4" opacity="0.3"/>
        </motion.g>
      </svg>
    </div>
  );
};

export default FlowerLine;
