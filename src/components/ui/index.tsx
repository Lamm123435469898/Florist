import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Package, Award, Users, Heart, Eye, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedNavbar } from "@/components/animated-navbar";
import { AnimatedFooter } from "@/components/animated-footer";
import { HeroAnimation } from "@/components/ui/hero-animation";
import { motion } from "framer-motion";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  is_featured: boolean | null;
}

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_featured", true)
      .limit(4);

    if (error) {
      console.error("Error fetching products:", error);
    } else {
      setProducts(data || []);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AnimatedNavbar />

      <HeroAnimation />

      {/* Featured Products Section */}
      <motion.section 
        className="relative bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 py-16 px-4 lg:px-[10%] overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {/* Animated Background Orbs */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-20 right-20 w-80 h-80 bg-pink-500/15 rounded-full blur-3xl"
            animate={{
              y: [0, 30, 0],
              x: [0, -30, 0],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-20 left-20 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl"
            animate={{
              y: [0, -30, 0],
              x: [0, 30, 0],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="relative z-10">
          <motion.div 
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="text-sm font-bold text-pink-300 uppercase tracking-wide mb-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Sản phẩm của chúng tôi
            </motion.div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">
              Khung Tranh Nổi Bật
            </h2>
            <p className="text-white/70 text-sm max-w-2xl mx-auto">
              Khám phá bộ sưu tập khung tranh hoa khô phát sáng độc đáo, được chế tác tỉ mỉ từ những bông hoa khô tự nhiên
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                className="group bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05, background: "rgba(255, 255, 255, 0.15)" }}
              >
                <div className="relative h-52 rounded-[110px] rounded-b-none overflow-hidden">
                  <img 
                    src={product.image_url || "https://via.placeholder.com/400x300?text=No+Image"} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay Actions */}
                  <motion.div 
                    className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.button 
                      className="bg-white/20 backdrop-blur-sm hover:bg-white hover:text-purple-900 text-white rounded-full h-8 w-8 flex items-center justify-center transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Heart className="h-4 w-4" />
                    </motion.button>
                    <Link to={`/products/${product.id}`}>
                      <motion.button 
                        className="bg-white/20 backdrop-blur-sm hover:bg-white hover:text-purple-900 text-white rounded-full h-8 w-8 flex items-center justify-center transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Eye className="h-4 w-4" />
                      </motion.button>
                    </Link>
                    <motion.button 
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-full h-8 w-8 flex items-center justify-center transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </motion.button>
                  </motion.div>
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-semibold text-lg text-white mb-1">
                    {product.name}
                  </h3>
                  <p className="text-pink-300 font-bold text-base">
                    {product.price.toLocaleString('vi-VN')} ₫
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="text-center mt-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Link to="/products">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-full px-8 shadow-lg"
                >
                  Xem tất cả sản phẩm
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Counter Section with Footer Style */}
      <motion.section 
        className="relative bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 py-16 px-4 lg:px-[10%] overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {/* Animated Background Orbs */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-10 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"
            animate={{
              y: [0, -20, 0],
              x: [0, 20, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-10 right-10 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl"
            animate={{
              y: [0, 20, 0],
              x: [0, -20, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Users, value: "1000+", label: "Khách hàng", productImage: products[0]?.image_url },
              { icon: Package, value: "500+", label: "Đơn hàng", productImage: products[1]?.image_url },
              { icon: Award, value: "50+", label: "Giải thưởng", productImage: products[2]?.image_url },
              { icon: Sparkles, value: "100%", label: "Tự nhiên", productImage: products[3]?.image_url },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-7 flex items-center gap-4 overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05, background: "rgba(255, 255, 255, 0.15)" }}
              >
                {/* Product Image Background */}
                {stat.productImage && (
                  <motion.div
                    className="absolute right-0 top-0 w-24 h-24 opacity-20"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <img 
                      src={stat.productImage} 
                      alt="" 
                      className="w-full h-full object-cover rounded-bl-3xl"
                    />
                  </motion.div>
                )}
                
                <motion.div 
                  className="bg-white/20 rounded-full h-14 w-14 flex items-center justify-center flex-shrink-0 relative z-10"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <stat.icon className="h-6 w-6 text-white" />
                </motion.div>
                <div className="relative z-10">
                  <motion.div 
                    className="text-3xl font-semibold text-white"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 200 }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-sm text-white/90 mt-1">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <AnimatedFooter />
    </div>
  );
};

export default Index;
