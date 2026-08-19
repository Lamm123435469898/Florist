import { motion } from "framer-motion";
import { useState, useEffect } from "react";

// Import local images
import hoakho1 from "@/images/hoakho1.jpg";
import hoakho2 from "@/images/hoakho2.jpg";
import hoakho3 from "@/images/hoakho3.jpg";
import hoakho4 from "@/images/hoakho4.jpg";

const bannerImages = [
  { id: 1, src: hoakho1, title: "Hoa Khô Nghê Thuât", description: "Thiên nhiên và tinh tê" },
  { id: 2, src: hoakho2, title: "Khung Tranh Phát Sáng", description: "Ánh sáng ma thuât" },
  { id: 3, src: hoakho3, title: "Trang Trí Hiên Dai", description: "Không gian sông dep" },
  { id: 4, src: hoakho4, title: "Quà Tâng Ý Nghia", description: "Món quà doc dao" }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3
    }
  }
};

const slideVariants = {
  hidden: { x: 100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.6, -0.05, 0.01, 0.99]
    }
  }
};

const textVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      delay: 0.2
    }
  }
};

export function LocalBanner() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % bannerImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const currentImage = bannerImages[currentImageIndex];

  return (
    <section className="relative w-full h-[600px] overflow-hidden">
      {/* Image Slider */}
      <div className="relative w-full h-full">
        {bannerImages.map((image, index) => (
          <motion.div
            key={image.id}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{
              opacity: index === currentImageIndex ? 1 : 0,
              scale: index === currentImageIndex ? 1 : 1.1,
              transition: { duration: 1.5, ease: "easeInOut" }
            }}
          >
            <img
              src={image.src}
              alt={image.title}
              className="w-full h-full object-cover"
            />
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <motion.div
        className="absolute inset-0 flex items-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="container mx-auto px-4 lg:px-[10%]">
          <motion.div
            className="max-w-2xl"
            variants={slideVariants}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 mb-6"
              variants={textVariants}
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-white text-sm font-medium">Bán sàn 2024</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight"
              variants={textVariants}
            >
              {currentImage.title}
            </motion.h1>

            {/* Description */}
            <motion.p
              className="text-xl md:text-2xl text-white/90 mb-8"
              variants={textVariants}
            >
              {currentImage.description}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              variants={textVariants}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                Khám Phá Ngay
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/20 backdrop-blur-sm text-white border border-white/30 px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/30 transition-all"
              >
                Xem Thêm
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Image Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3">
        {bannerImages.map((_, index) => (
          <motion.button
            key={index}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentImageIndex ? "bg-white w-8" : "bg-white/50"
            }`}
            onClick={() => setCurrentImageIndex(index)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.8 }}
          />
        ))}
      </div>

      {/* Floating Elements */}
      <motion.div
        className="absolute top-10 right-10 hidden lg:block"
        animate={{
          y: [-10, 10, -10],
          rotate: [-5, 5, -5]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-20 h-20 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-xl" />
      </motion.div>

      <motion.div
        className="absolute bottom-10 left-10 hidden lg:block"
        animate={{
          y: [10, -10, 10],
          rotate: [5, -5, 5]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      >
        <div className="w-16 h-16 bg-gradient-to-br from-orange-400/30 to-yellow-400/30 rounded-full blur-lg" />
      </motion.div>
    </section>
  );
}

// Static Banner Grid Component
export function BannerGrid() {
  return (
    <section className="py-16 px-4 lg:px-[10%]">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
          Sàn Pham Nôi Bat
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Khám phá nhung kiêt tác hoa khô phát sáng doc dao, mang ve dep tu nhiên vào không gian sông cua ban.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {bannerImages.map((image, index) => (
          <motion.div
            key={image.id}
            className="relative group cursor-pointer overflow-hidden rounded-2xl"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
          >
            <img
              src={image.src}
              alt={image.title}
              className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="font-semibold text-lg mb-1">{image.title}</h3>
                <p className="text-sm text-white/80">{image.description}</p>
              </div>
            </div>

            {/* Shimmer Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 0.6 }}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
