import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const VerticalFlowerLine = () => {
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

  return (
    <>
      {/* Subtle left decorative line */}
      <div className="fixed left-6 top-0 h-full w-4 pointer-events-none z-30 hidden lg:block">
        <div className="absolute left-1/2 transform -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
        <motion.div
          className="absolute left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-accent rounded-full shadow-sm"
          style={{ top: `${scrollProgress}%` }}
        />
      </div>

      {/* Subtle right decorative line */}
      <div className="fixed right-6 top-0 h-full w-4 pointer-events-none z-30 hidden lg:block">
        <div className="absolute left-1/2 transform -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
        <motion.div
          className="absolute left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-accent rounded-full shadow-sm"
          style={{ top: `${scrollProgress}%` }}
        />
      </div>
    </>
  );
};

export default VerticalFlowerLine;
