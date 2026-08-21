import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import { ArrowRight, Leaf, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedNavbar } from "@/components/animated-navbar";
import { AnimatedFooter } from "@/components/animated-footer";
import VerticalFlowerLine from "@/components/vertical-flower-line";
import { motion } from "framer-motion";
import { AnimatedProductCard } from "@/components/ui/animated-card";

import hoakho1 from "@/images/hoakho1.jpg";
import hoakho2 from "@/images/hoakho2.jpg";
import banner2 from "@/images/banner2.jpeg";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  variant_id?: string;
  category: string | null;
}

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await apiClient.get("/products?pageSize=4");
        if (data.success && data.data?.items) {
          const mappedProducts = data.data.items.map((item: any) => ({
            id: item.id,
            variant_id: item.variants?.[0]?.id,
            name: item.name,
            price: item.variants?.[0]?.price || 0,
            image_url: item.images?.find((img: any) => img.isPrimary)?.imageUrl || item.images?.[0]?.imageUrl || null,
            category: item.categoryName
          }));
          setProducts(mappedProducts);
        }
      } catch (error) {
        console.error("Failed to load products", error);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <VerticalFlowerLine />
      <AnimatedNavbar />

      {/* Hero Section - Cinematic */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <img 
            src={banner2} 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto px-4 lg:px-[10%]">
          <motion.div 
            className="max-w-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-block py-1 px-3 border border-primary/20 bg-primary/5 text-primary text-xs tracking-widest uppercase mb-6 rounded-full">
              Thủ công & Nghệ thuật
            </span>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground leading-[1.1] mb-6">
              Lưu giữ vẻ đẹp <br/>
              <span className="text-primary italic font-normal">vượt thời gian</span>
            </h1>
            <p className="text-lg text-foreground/70 mb-10 max-w-lg leading-relaxed">
              Những khung tranh hoa khô được chế tác thủ công tỉ mỉ, mang hơi thở của thiên nhiên và nghệ thuật vào không gian sống của bạn.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/products">
                <Button className="h-12 px-8 bg-primary hover:bg-primary/90 text-white rounded-none text-base tracking-wide flex items-center gap-2">
                  Khám phá bộ sưu tập <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" className="h-12 px-8 rounded-none border-primary text-primary hover:bg-primary/5 text-base tracking-wide">
                  Câu chuyện của chúng tôi
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-[10%]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-border">
            <motion.div 
              className="flex flex-col items-center pt-8 md:pt-0 px-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="h-16 w-16 bg-secondary rounded-full flex items-center justify-center mb-6 text-primary">
                <Leaf className="h-8 w-8" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-3">100% Tự Nhiên</h3>
              <p className="text-foreground/70 text-sm leading-relaxed">Sử dụng hoa khô cao cấp, giữ nguyên màu sắc và vẻ đẹp nguyên bản.</p>
            </motion.div>
            <motion.div 
              className="flex flex-col items-center pt-8 md:pt-0 px-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="h-16 w-16 bg-secondary rounded-full flex items-center justify-center mb-6 text-primary">
                <ShieldCheck className="h-8 w-8" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-3">Chế Tác Thủ Công</h3>
              <p className="text-foreground/70 text-sm leading-relaxed">Mỗi sản phẩm là một tác phẩm nghệ thuật độc bản, làm bằng tất cả tâm huyết.</p>
            </motion.div>
            <motion.div 
              className="flex flex-col items-center pt-8 md:pt-0 px-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <div className="h-16 w-16 bg-secondary rounded-full flex items-center justify-center mb-6 text-primary">
                <Truck className="h-8 w-8" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-3">Giao Hàng An Toàn</h3>
              <p className="text-foreground/70 text-sm leading-relaxed">Đóng gói cẩn thận, đảm bảo sản phẩm nguyên vẹn khi đến tay bạn.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-[10%]">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">Bộ Sưu Tập <br/> Nổi Bật</h2>
              <p className="text-foreground/70 max-w-md">Những tác phẩm được yêu thích nhất, kết hợp hoàn hảo giữa vẻ đẹp hoa cỏ và ánh sáng.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Link to="/products" className="group inline-flex items-center gap-2 text-primary font-medium hover:text-primary/80 transition-colors">
                Xem tất cả
                <span className="h-px w-8 bg-primary group-hover:w-12 transition-all duration-300" />
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.length > 0
              ? products.map((p, i) => (
                  <AnimatedProductCard 
                    key={p.id} 
                    id={p.id}
                    name={p.name}
                    price={p.price}
                    imageUrl={p.image_url}
                    category={p.category}
                    variantId={p.variant_id}
                  />
                ))
              : [hoakho1, hoakho2, hoakho1, hoakho2].map((img, i) => (
                  <AnimatedProductCard 
                    key={i} 
                    id={i.toString()}
                    name={`Khung hoa khô nghệ thuật ${i + 1}`}
                    price={500000}
                    imageUrl={img}
                    category="Mẫu mới"
                  />
                ))}
          </div>
        </div>
      </section>

      {/* About Teaser */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4 lg:px-[10%]">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div 
              className="lg:w-1/2 relative"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="aspect-[4/5] bg-secondary w-full relative overflow-hidden">
                <img src={hoakho1} alt="About Florist" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-background p-4 hidden md:block">
                <img src={hoakho2} alt="Detail" className="w-full h-full object-cover" />
              </div>
            </motion.div>
            
            <motion.div 
              className="lg:w-1/2"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-6">Câu chuyện của Florist</h2>
              <p className="text-foreground/70 text-lg leading-relaxed mb-6">
                Bắt nguồn từ tình yêu với những cánh hoa mỏng manh, Florist ra đời với mong muốn mang vẻ đẹp của thiên nhiên lưu giữ mãi theo thời gian.
              </p>
              <p className="text-foreground/70 text-lg leading-relaxed mb-10">
                Mỗi khung tranh là sự kết hợp hoàn hảo giữa nghệ thuật sắp đặt hoa khô và hiệu ứng ánh sáng dịu nhẹ, tạo nên một không gian ấm áp và đầy cảm hứng cho ngôi nhà của bạn.
              </p>
              <Link to="/about">
                <Button className="h-12 px-8 bg-foreground hover:bg-foreground/90 text-white rounded-none text-base tracking-wide flex items-center gap-2">
                  Đọc thêm <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <AnimatedFooter />
    </div>
  );
};

export default Index;
