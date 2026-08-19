import { Link } from "react-router-dom";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Instagram, 
  ArrowRight,
} from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

export function AnimatedFooter() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Subscribed:", email);
    setEmail("");
  };

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
  ];

  const quickLinks = [
    { label: "Trang chủ", href: "/" },
    { label: "Bộ sưu tập", href: "/products" },
    { label: "Câu chuyện", href: "/about" },
    { label: "Liên hệ", href: "/contact" },
  ];

  const services = [
    { label: "Khung tranh hoa khô", href: "/products" },
    { label: "Quà tặng doanh nghiệp", href: "/products" },
    { label: "Trang trí không gian", href: "/products" },
    { label: "Thiết kế theo yêu cầu", href: "/contact" },
  ];

  return (
    <footer className="bg-primary text-primary-foreground border-t border-primary/20 pt-20 pb-10">
      <div className="px-4 lg:px-[10%]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-primary-foreground/10">

          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <Link to="/" className="flex items-center gap-3">
                <span className="font-serif text-3xl font-bold tracking-tight text-white">
                  Florist<span className="text-accent">.</span>
                </span>
              </Link>
            </div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed mb-8">
              Lưu giữ vẻ đẹp thời gian qua những khung tranh hoa khô nghệ thuật. Sự tinh tế trong từng cánh hoa, sự sang trọng trong từng thiết kế.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="bg-primary-foreground/5 hover:bg-accent hover:text-primary transition-all duration-300 rounded-full h-10 w-10 flex items-center justify-center border border-primary-foreground/10"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif font-semibold text-xl mb-6 text-white tracking-wide">Khám Phá</h3>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/70 hover:text-accent transition-colors flex items-center gap-2 group text-sm"
                  >
                    <span className="h-px w-0 bg-accent transition-all duration-300 group-hover:w-4" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-serif font-semibold text-xl mb-6 text-white tracking-wide">Dịch Vụ</h3>
            <ul className="space-y-4">
              {services.map((service) => (
                <li key={service.label}>
                  <Link
                    to={service.href}
                    className="text-primary-foreground/70 hover:text-accent transition-colors flex items-center gap-2 group text-sm"
                  >
                    <span className="h-px w-0 bg-accent transition-all duration-300 group-hover:w-4" />
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-serif font-semibold text-xl mb-6 text-white tracking-wide">Bản Tin</h3>
            <p className="text-primary-foreground/70 text-sm mb-4 leading-relaxed">
              Đăng ký để nhận thông tin về các bộ sưu tập mới và ưu đãi đặc quyền.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <input
                type="email"
                placeholder="Email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-primary-foreground/5 border border-primary-foreground/20 text-white placeholder:text-primary-foreground/40 focus:outline-none focus:border-accent transition-colors text-sm"
              />
              <Button
                type="submit"
                className="w-full bg-accent hover:bg-accent/90 text-primary font-medium py-3 rounded-none flex items-center justify-center gap-2"
              >
                Đăng ký
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Contact Info & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-12">
            <div className="flex items-center gap-3 text-primary-foreground/80 text-sm">
              <Phone className="h-4 w-4 text-accent" />
              <span>0929 297 939</span>
            </div>
            <div className="flex items-center gap-3 text-primary-foreground/80 text-sm">
              <Mail className="h-4 w-4 text-accent" />
              <span>floristhcm@gmail.com</span>
            </div>
            <div className="flex items-center gap-3 text-primary-foreground/80 text-sm">
              <MapPin className="h-4 w-4 text-accent" />
              <span>TP. Hồ Chí Minh</span>
            </div>
          </div>
          
          <div className="text-primary-foreground/50 text-sm text-center md:text-right">
            © 2024 Florist. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

export default AnimatedFooter;
