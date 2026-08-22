import { useState } from "react";
import { AnimatedNavbar } from "@/components/animated-navbar";
import { AnimatedFooter } from "@/components/animated-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import VerticalFlowerLine from "@/components/vertical-flower-line";
import { motion } from "framer-motion";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Gửi thành công",
        description: "Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.",
      });
      setFormData({ name: "", email: "", phone: "", message: "" });
      setIsSubmitting(false);
    }, 1000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
            Liên Hệ
          </motion.h1>
          <motion.p 
            className="text-foreground/70 max-w-2xl mx-auto text-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Đừng ngần ngại để lại thông tin, chúng tôi luôn sẵn lòng lắng nghe và hỗ trợ bạn.
          </motion.p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 px-4 lg:px-[10%] flex-1">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-serif font-bold text-foreground mb-8">Thông Tin Liên Hệ</h2>
              
              <div className="space-y-8 mb-12">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-sm bg-secondary/30 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-foreground mb-1">Địa chỉ</h3>
                    <p className="text-sm text-foreground/70">Quận 1, TP. Hồ Chí Minh, Việt Nam</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-sm bg-secondary/30 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-foreground mb-1">Điện thoại</h3>
                    <p className="text-sm text-foreground/70">+84 929 297 939</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-sm bg-secondary/30 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-foreground mb-1">Email</h3>
                    <p className="text-sm text-foreground/70">floristhcm@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-sm bg-secondary/30 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-foreground mb-1">Giờ làm việc</h3>
                    <p className="text-sm text-foreground/70">Thứ 2 - Chủ nhật: 8:00 - 22:00</p>
                  </div>
                </div>
              </div>

              <div className="aspect-video bg-secondary/30 rounded-sm w-full overflow-hidden">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.424167419741!2d106.69830531474853!3d10.77878849231991!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f492b49c0fb%3A0x8e8334c9c1b74a38!2sDistrict%201%2C%20Ho%2C%20Chi%20Minh%20City%2C%20Vietnam!5e0!3m2!1sen!2s!4v1622340570691!5m2!1sen!2s" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={true} 
                  loading="lazy">
                </iframe>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-white p-8 rounded-sm border border-border">
                <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Gửi tin nhắn</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm text-foreground/80">Họ và tên</label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Nhập họ và tên"
                      required
                      className="bg-secondary/20 border-border focus-visible:ring-primary/20 rounded-sm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm text-foreground/80">Email</label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@example.com"
                      required
                      className="bg-secondary/20 border-border focus-visible:ring-primary/20 rounded-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-foreground/80">Số điện thoại</label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="0123 456 789"
                      required
                      className="bg-secondary/20 border-border focus-visible:ring-primary/20 rounded-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-foreground/80">Tin nhắn</label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Nội dung tin nhắn..."
                      rows={5}
                      required
                      className="bg-secondary/20 border-border focus-visible:ring-primary/20 rounded-sm resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary/90 text-white rounded-none h-12 tracking-wide mt-2"
                  >
                    {isSubmitting ? "Đang gửi..." : "Gửi tin nhắn"}
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <AnimatedFooter />
    </div>
  );
};

export default Contact;
