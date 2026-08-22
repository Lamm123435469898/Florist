import { AnimatedNavbar } from "@/components/animated-navbar";
import { AnimatedFooter } from "@/components/animated-footer";
import VerticalFlowerLine from "@/components/vertical-flower-line";
import { Leaf, Heart, Users, Shield } from "lucide-react";
import { motion } from "framer-motion";
import hoakho5 from "@/images/hoakho5.jpg";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <VerticalFlowerLine />
      <AnimatedNavbar />

      {/* Page Header */}
      <section className="pt-32 pb-16 bg-secondary/10">
        <div className="container mx-auto px-4 lg:px-[10%] text-center">
          <motion.h1 
            className="text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Về Florist
          </motion.h1>
          <motion.p 
            className="text-foreground/70 max-w-2xl mx-auto text-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Hành trình mang vẻ đẹp nguyên bản của thiên nhiên vào không gian sống của bạn.
          </motion.p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 px-4 lg:px-[10%] bg-white">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <motion.div 
              className="lg:w-1/2"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-serif font-bold text-foreground mb-6">Câu Chuyện Của Chúng Tôi</h2>
              <div className="space-y-4 text-foreground/70 leading-relaxed text-sm">
                <p>
                  Florist được thành lập với niềm đam mê mãnh liệt về vẻ đẹp tự nhiên và nghệ thuật. 
                  Chúng tôi tin rằng mỗi bông hoa khô đều mang trong mình một câu chuyện riêng, một khoảnh khắc đẹp được lưu giữ mãi mãi.
                </p>
                <p>
                  Với đội ngũ nghệ nhân tài hoa và giàu kinh nghiệm, chúng tôi chế tác từng khung tranh 
                  hoa khô một cách tỉ mỉ và cẩn thận. Mỗi sản phẩm của Florist không chỉ là một món đồ 
                  trang trí, mà còn là một tác phẩm nghệ thuật độc đáo, mang đến không gian sống 
                  ấm áp và tràn đầy cảm hứng.
                </p>
              </div>
            </motion.div>
            <motion.div 
              className="lg:w-1/2 aspect-[4/3] bg-secondary/30 w-full rounded-sm"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img 
                src={hoakho5} 
                alt="Story" 
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 px-4 lg:px-[10%] bg-secondary/10">
        <div className="container mx-auto text-center">
          <motion.h2 
            className="text-3xl font-serif font-bold text-foreground mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Giá Trị Cốt Lõi
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Leaf, title: "100% Tự Nhiên", desc: "Sử dụng hoa khô cao cấp, giữ nguyên màu sắc." },
              { icon: Heart, title: "Tâm Huyết", desc: "Chế tác bằng tình yêu và sự tận tâm của nghệ nhân." },
              { icon: Shield, title: "Bền Vững", desc: "Cam kết chất lượng lâu dài theo thời gian." },
              { icon: Users, title: "Khách Hàng", desc: "Sự hài lòng của khách hàng là thành công lớn nhất." },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
              <motion.div
                key={item.title}
                className="bg-white p-8 rounded-sm text-center border border-border"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Icon className="h-8 w-8 text-primary mx-auto mb-6" strokeWidth={1.5} />
                <h3 className="font-serif font-bold text-lg text-foreground mb-3">{item.title}</h3>
                <p className="text-sm text-foreground/60">{item.desc}</p>
              </motion.div>
            )})}
          </div>
        </div>
      </section>

      <AnimatedFooter />
    </div>
  );
};

export default About;
