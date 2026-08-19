import { Link } from "react-router-dom";
import { MapPin, Clock, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-pink-600 via-pink-500 to-rose-400 text-white pt-16 pb-0">
      <div className="px-4 lg:px-[10%]">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-10 border-b border-white/20">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img
                src="https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100034954/66ed.jpg"
                alt="Florist"
                className="h-10 w-10 rounded-full object-cover"
              />
              <span className="text-xl font-bold">Florist</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-4">
              Chuyên cung cap khung tranh hoa khô phát sáng doc dao, mang ve dep tu nhiên
              và nghê thuât vào không gian sông cua ban.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="bg-white/10 hover:bg-rose-300 transition-colors rounded-full h-9 w-9 flex items-center justify-center"
              >
                <span className="sr-only">Instagram</span>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                </svg>
              </a>
              <a
                href="#"
                className="bg-white/10 hover:bg-rose-300 transition-colors rounded-full h-9 w-9 flex items-center justify-center"
              >
                <span className="sr-only">Facebook</span>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên kê't</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li><Link to="/about" className="hover:text-white transition-colors">Vê chúng tôi</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Sân phâm</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Chính sách</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Diêù khoân</a></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Liên hê</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Dich vu</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li><a href="#" className="hover:text-white transition-colors">Huong dân mua hàng</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Chính sách dôi trâ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Giao hàng</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Bão hành</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Thanh toán</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên hê</h3>
            <div className="space-y-3 text-sm text-white/70">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-rose-300 mt-0.5 flex-shrink-0" />
                <span>Hà Nôi, Viêt Nam</span>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-rose-300 mt-0.5 flex-shrink-0" />
                <span>Thú 2 - Chú nhât<br/>8:00 sáng - 22:00 tói</span>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-rose-300 mt-0.5 flex-shrink-0" />
                <a href="mailto:info@florist.vn" className="hover:text-white transition-colors">
                  info@florist.vn
                </a>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-rose-300 mt-0.5 flex-shrink-0" />
                <a href="tel:+84123456789" className="hover:text-white transition-colors">
                  +84 123 456 789
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between py-4 text-xs text-white/60">
          <span>© 2026 Florist. All rights reserved.</span>
          <span className="mt-2 sm:mt-0">
            Thiêt kê bôi <a href="#" className="hover:text-rose-300 transition-colors">Florist Team</a>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
