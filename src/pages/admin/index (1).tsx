import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Sparkles, Package, Award, Users,
  Heart, Eye, ShoppingCart, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedNavbar } from "@/components/animated-navbar";
import { AnimatedFooter } from "@/components/animated-footer";
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

/* ─────────────────────────────────────────
   HERO SECTION
   Replaces <HeroAnimation /> — ảnh sản phẩm
   được hiển thị đúng kích thước, bao phủ đầy đủ
   ───────────────────────────────────────── */
const HeroSection = ({ products }: { products: Product[] }) => {
  const fallbacks = [
    "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400&q=80",
    "https://images.unsplash.com/photo-1490750967868-88df5691cc4a?w=400&q=80",
    "https://images.unsplash.com/photo-1457089328109-e5d9bd499191?w=400&q=80",
    "https://images.unsplash.com/photo-1487530811015-780be4d71ecc?w=400&q=80",
  ];
  const imgs = [0, 1, 2, 3].map((i) => products[i]?.image_url || fallbacks[i]);

  /* 4 card configs: position / size / tilt */
  const cards = [
    { top: "6%",  left: "2%",  w: 158, h: 200, rotate: -7, delay: 0,    circle: false },
    { top: "4%",  left: "28%", w: 165, h: 205, rotate:  5, delay: 0.12, circle: false },
    { top: "53%", left: "1%",  w: 152, h: 192, rotate: -4, delay: 0.22, circle: false },
    { top: "50%", left: "27%", w: 198, h: 198, rotate:  0, delay: 0.32, circle: true  },
  ];

  return (
    <section
      className="relative min-h-screen overflow-hidden flex items-center"
      style={{
        background:
          "linear-gradient(135deg, #c026d3 0%, #a21caf 28%, #db2777 65%, #ec4899 100%)",
      }}
    >
      {/* dot grid */}
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      {/* glow orbs */}
      <motion.div
        className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-purple-700/30 blur-[130px] pointer-events-none"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-0 right-1/3 w-[380px] h-[380px] rounded-full bg-pink-400/20 blur-[100px] pointer-events-none"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 pt-28 pb-20
                      flex flex-col lg:flex-row items-center gap-10">

        {/* ── LEFT: 4 floating product images ── */}
        <div className="relative w-full lg:w-[480px] h-[520px] flex-shrink-0 select-none">
          {cards.map((c, i) => (
            <motion.div
              key={i}
              className="absolute overflow-hidden shadow-2xl shadow-black/50"
              style={{
                top: c.top,
                left: c.left,
                width: c.w,
                height: c.h,
                borderRadius: c.circle ? "50%" : "20px",
                border: "3px solid rgba(255,255,255,0.3)",
              }}
              initial={{ opacity: 0, y: 50, rotate: c.rotate - 8 }}
              animate={{ opacity: 1, y: 0, rotate: c.rotate }}
              transition={{ delay: c.delay, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.07, zIndex: 20 }}
            >
              {/* THE FIX: w-full h-full object-cover — ảnh lấp đầy khung hoàn toàn */}
              <img
                src={imgs[i]}
                alt={`sản phẩm ${i + 1}`}
                className="w-full h-full object-cover block"
                draggable={false}
                style={{ display: "block" }}
              />
              {/* gloss shimmer */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent pointer-events-none" />
            </motion.div>
          ))}

          {/* live badge */}
          <motion.div
            className="absolute z-30 bg-white/20 backdrop-blur-md border border-white/30
                       rounded-full px-4 py-2 flex items-center gap-2 shadow-xl"
            style={{ top: "34%", left: "50%", transform: "translateX(-50%)" }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.65, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
            <span className="text-white text-[11px] font-semibold whitespace-nowrap">
              Mùa hoa baru 2024
            </span>
          </motion.div>
        </div>

        {/* ── RIGHT: headline + CTA ── */}
        <div className="flex-1 text-center lg:text-right">
          <motion.p
            className="text-white/70 text-sm tracking-widest uppercase mb-5"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Chuyên cung cấp khung tranh hoa khô phát sáng độc đáo
          </motion.p>

          <motion.h1
            className="font-extrabold leading-none mb-4"
            style={{ fontSize: "clamp(2.8rem, 6.5vw, 5.5rem)" }}
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-white block">Vé Dép Tú</span>
            <span
              className="block"
              style={{
                background: "linear-gradient(90deg, #fde68a 0%, #fbbf24 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Thiên Nhiên
            </span>
          </motion.h1>

          <motion.p
            className="text-white/65 text-base mb-10 max-w-md mx-auto lg:ml-auto lg:mr-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.7 }}
          >
            Mỗi khung tranh là tác phẩm độc bản — hoa khô tự nhiên, ánh sáng huyền ảo, vẻ đẹp vĩnh cửu.
          </motion.p>

          <motion.div
            className="flex items-center justify-center lg:justify-end gap-4 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.7 }}
          >
            <Link to="/products">
              <motion.button
                className="group flex items-center gap-2 px-8 py-3.5 rounded-full bg-white
                           text-purple-700 font-bold text-sm shadow-xl hover:shadow-white/30 transition-shadow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                Khám Phá Ngay
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
            <motion.button
              className="px-8 py-3.5 rounded-full border-2 border-white/40 text-white
                         font-semibold text-sm hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              Xem bộ sưu tập
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* scroll indicator */}
      <motion.div
        className="absolute bottom-7 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-9 rounded-full border-2 border-white/40 flex items-start justify-center pt-1.5">
          <div className="w-1 h-2 rounded-full bg-white/60" />
        </div>
      </motion.div>
    </section>
  );
};

/* ─────────────────────────────────────────
   PRODUCT CARD
   ───────────────────────────────────────── */
const ProductCard = ({ product, index }: { product: Product; index: number }) => {
  const [liked, setLiked] = useState(false);

  return (
    <motion.div
      className="group relative rounded-3xl overflow-hidden bg-white/10 backdrop-blur-md
                 border border-white/20 hover:border-pink-400/40 transition-all duration-500"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ scale: 1.03 }}
    >
      <div className="relative h-56 overflow-hidden">
        <motion.img
          src={product.image_url || "https://via.placeholder.com/400x300?text=No+Image"}
          alt={product.name}
          className="w-full h-full object-cover block"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        <div className="absolute inset-0 flex items-end justify-center pb-4 gap-3
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <motion.button
            onClick={() => setLiked(!liked)}
            className={`h-9 w-9 rounded-full backdrop-blur-md flex items-center justify-center
                        transition-colors shadow-lg
                        ${liked ? "bg-pink-500 text-white" : "bg-white/20 text-white hover:bg-pink-500"}`}
            whileTap={{ scale: 0.85 }}
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-white" : ""}`} />
          </motion.button>
          <Link to={`/products/${product.id}`}>
            <motion.button
              className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-md text-white
                         hover:bg-white hover:text-purple-900 flex items-center justify-center
                         transition-colors shadow-lg"
              whileTap={{ scale: 0.85 }}
            >
              <Eye className="h-4 w-4" />
            </motion.button>
          </Link>
          <motion.button
            className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-600 to-pink-600
                       text-white flex items-center justify-center shadow-lg
                       hover:from-purple-500 hover:to-pink-500 transition-colors"
            whileTap={{ scale: 0.85 }}
          >
            <ShoppingCart className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      <div className="p-4 text-center">
        <h3 className="font-semibold text-white text-base mb-1 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-pink-300 font-bold">
          {product.price.toLocaleString("vi-VN")} ₫
        </p>
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────
   MAIN PAGE
   ───────────────────────────────────────── */
const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_featured", true)
        .limit(4);
      if (!error) setProducts(data || []);
    })();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <AnimatedNavbar />

      {/* Hero với ảnh sản phẩm bao phủ đúng */}
      <HeroSection products={products} />

      {/* Featured Products */}
      <motion.section
        className="relative bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900
                   py-20 px-4 lg:px-[10%] overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-20 right-20 w-80 h-80 bg-pink-500/15 rounded-full blur-3xl"
            animate={{ y: [0, 30, 0], x: [0, -30, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-20 left-20 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl"
            animate={{ y: [0, -30, 0], x: [0, 30, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="relative z-10">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-sm font-bold text-pink-300 uppercase tracking-widest mb-2">
              Sản phẩm của chúng tôi
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">
              Khung Tranh Nổi Bật
            </h2>
            <p className="text-white/60 text-sm max-w-xl mx-auto">
              Khám phá bộ sưu tập khung tranh hoa khô phát sáng độc đáo, được chế tác tỉ mỉ từ những bông hoa khô tự nhiên
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.length > 0
              ? products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
              : [...Array(4)].map((_, i) => (
                  <div key={i} className="rounded-3xl bg-white/5 border border-white/10 h-72 animate-pulse" />
                ))}
          </div>

          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Link to="/products">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600
                             hover:from-purple-500 hover:to-pink-500
                             text-white font-semibold rounded-full px-10 shadow-lg shadow-pink-500/30"
                >
                  Xem tất cả sản phẩm
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats */}
      <motion.section
        className="relative bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900
                   py-16 px-4 lg:px-[10%] overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-10 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"
            animate={{ y: [0, -20, 0], x: [0, 20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-10 right-10 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl"
            animate={{ y: [0, 20, 0], x: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Users,    value: "1000+", label: "Khách hàng",  img: products[0]?.image_url },
            { icon: Package,  value: "500+",  label: "Đơn hàng",    img: products[1]?.image_url },
            { icon: Award,    value: "50+",   label: "Giải thưởng", img: products[2]?.image_url },
            { icon: Sparkles, value: "100%",  label: "Tự nhiên",    img: products[3]?.image_url },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              className="relative bg-white/10 backdrop-blur-md border border-white/20
                         rounded-2xl p-7 flex items-center gap-4 overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.05, background: "rgba(255,255,255,0.15)" }}
            >
              {s.img && (
                <div className="absolute right-0 top-0 w-20 h-20 opacity-20 overflow-hidden rounded-bl-3xl">
                  <img src={s.img} alt="" className="w-full h-full object-cover block" />
                </div>
              )}
              <motion.div
                className="bg-white/20 rounded-full h-14 w-14 flex items-center justify-center flex-shrink-0 z-10"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <s.icon className="h-6 w-6 text-white" />
              </motion.div>
              <div className="z-10">
                <motion.div
                  className="text-3xl font-bold text-white"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 + 0.2, type: "spring", stiffness: 200 }}
                >
                  {s.value}
                </motion.div>
                <div className="text-sm text-white/80 mt-0.5">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <AnimatedFooter />
    </div>
  );
};

export default Index;
