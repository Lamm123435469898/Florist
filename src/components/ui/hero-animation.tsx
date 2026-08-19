import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { ParallaxBackground } from "./parallax-section";
import { LocalBanner } from "./local-banner";

// Import images
import banner from "@/images/banner.jpg";
import hoakho1 from "@/images/hoakho1.jpg";
import hoakho2 from "@/images/hoakho2.jpg";
import hoakho3 from "@/images/hoakho3.jpg";
import hoakho4 from "@/images/hoakho4.jpg";
import hoakho5 from "@/images/hoakho5.jpg";
import hoakho6 from "@/images/hoakho6.jpg";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.8
    }
  }
};

const floatingVariants = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 3,
      repeat: Infinity
    }
  }
};

const gradientVariants = {
  initial: { backgroundPosition: "0% 50%" },
  animate: {
    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
    transition: {
      duration: 8,
      repeat: Infinity
    }
  }
};

export function HeroAnimation() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Parallax Background */}
      <ParallaxBackground />
      
      {/* Animated Gradient Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400"
        variants={gradientVariants}
        initial="initial"
        animate="animate"
        style={{
          backgroundSize: "400% 400%"
        }}
      />
      
      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            variants={floatingVariants}
            initial="initial"
            animate="animate"
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      {/* Hero Content - Right Side */}
      <motion.div
        className="relative z-10 text-right px-4 max-w-2xl ml-auto mr-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Floating Badge */}
        <motion.div
          className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 mb-8"
          variants={itemVariants}
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-white text-sm font-medium">Mùa hoa baru 2024</span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
          variants={itemVariants}
        >
          <span className="block">Vé Dép Tú</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-200">
            Thiên Nhiên
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-sm md:text-base text-white/80 mb-6 max-w-2xl mx-auto"
          variants={itemVariants}
        >
          Chuyên cung câp khung tranh hoa khô phát sáng doc dao
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          variants={itemVariants}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90 px-8 py-6 text-lg font-semibold rounded-full">
              Khám Phá Ngay
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600 px-8 py-6 text-lg font-semibold rounded-full backdrop-blur-sm">
              <Play className="mr-2 h-5 w-5" />
              Xem Demo
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Grid + Featured Image Layout - Left Side */}
      <motion.div 
        className="absolute top-1/2 left-8 transform -translate-y-1/2 hidden lg:block z-10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        style={{ marginTop: '-100px' }}
      >
        <div className="relative w-[500px] h-[500px]">
          {/* Featured Image - Center Large */}
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-56 h-56 bg-white/10 backdrop-blur-md rounded-full p-4 border border-white/30 shadow-2xl">
              <img 
                src={banner} 
                alt="Banner" 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </motion.div>

          {/* Small Images Grid Around */}
          {/* Top Left */}
          <motion.div
            className="absolute top-0 left-0"
            initial={{ opacity: 0, x: -30, y: -30 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <div className="w-32 h-40 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 shadow-xl">
              <img src={hoakho1} alt="Hoa khô 1" className="w-full h-full object-cover rounded-xl" />
            </div>
          </motion.div>

          {/* Top Right */}
          <motion.div
            className="absolute top-0 right-0"
            initial={{ opacity: 0, x: 30, y: -30 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            whileHover={{ scale: 1.1, rotate: -5 }}
          >
            <div className="w-32 h-40 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 shadow-xl">
              <img src={hoakho2} alt="Hoa khô 2" className="w-full h-full object-cover rounded-xl" />
            </div>
          </motion.div>

          {/* Middle Left */}
          <motion.div
            className="absolute top-1/2 left-0 transform -translate-y-1/2"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            whileHover={{ scale: 1.1, rotate: -5 }}
          >
            <div className="w-28 h-36 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 shadow-xl">
              <img src={hoakho3} alt="Hoa khô 3" className="w-full h-full object-cover rounded-xl" />
            </div>
          </motion.div>

          {/* Middle Right */}
          <motion.div
            className="absolute top-1/2 right-0 transform -translate-y-1/2"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <div className="w-28 h-36 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 shadow-xl">
              <img src={hoakho4} alt="Hoa khô 4" className="w-full h-full object-cover rounded-xl" />
            </div>
          </motion.div>

          {/* Bottom Left */}
          <motion.div
            className="absolute bottom-0 left-0"
            initial={{ opacity: 0, x: -30, y: 30 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <div className="w-32 h-40 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 shadow-xl">
              <img src={hoakho5} alt="Hoa khô 5" className="w-full h-full object-cover rounded-xl" />
            </div>
          </motion.div>

          {/* Bottom Right */}
          <motion.div
            className="absolute bottom-0 right-0"
            initial={{ opacity: 0, x: 30, y: 30 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            whileHover={{ scale: 1.1, rotate: -5 }}
          >
            <div className="w-32 h-40 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 shadow-xl">
              <img src={hoakho6} alt="Hoa khô 6" className="w-full h-full object-cover rounded-xl" />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.8 }}
      >
        <motion.div
          className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="w-1 h-3 bg-white rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
