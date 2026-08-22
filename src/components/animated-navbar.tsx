import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, 
  Search, 
  MapPin, 
  Phone, 
  User, 
  LogOut, 
  LayoutDashboard,
  Menu,
  X,
  Heart
} from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export function AnimatedNavbar() {
  const { user, isAuthenticated, isAdmin, signOut } = useAuth();
  const { totalItems } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "Đã đăng xuất" });
    navigate("/");
  };

  const navLinks = [
    { path: "/", label: "Trang chủ" },
    { path: "/products", label: "Bộ sưu tập" },
    { path: "/about", label: "Câu chuyện" },
    { path: "/contact", label: "Liên hệ" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-500">
      {/* Top Bar - Minimalist */}
      <div 
        className={`bg-primary text-primary-foreground text-xs py-1.5 px-4 lg:px-[10%] transition-all duration-500 ${scrolled ? 'h-0 opacity-0 overflow-hidden py-0' : 'h-auto opacity-100'}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3" />
              TP. Hồ Chí Minh
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 tracking-wider uppercase text-[10px]">
            Miễn phí giao hàng nội thành
            <span className="text-white/30">|</span>
            <span className="flex items-center gap-1.5">
              <Phone className="h-3 w-3" />
              0929 297 939
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div 
        className={`w-full transition-all duration-500 ${
          scrolled 
            ? "bg-white/90 backdrop-blur-md shadow-sm py-3" 
            : "bg-white/80 backdrop-blur-sm py-5 border-b border-gray-100"
        }`}
      >
        <div className="px-4 lg:px-[10%] flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <span className="font-serif text-2xl font-bold tracking-tight text-primary">
              Florist<span className="text-accent">.</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="relative group py-2"
                >
                  <span className={`text-sm font-medium tracking-wide transition-colors ${isActive ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}>
                    {link.label}
                  </span>
                  <span 
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-primary transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="text-gray-500 hover:text-primary transition-colors">
              <Search className="h-5 w-5" strokeWidth={1.5} />
            </button>
            
            <Link to="/wishlist" className="relative text-gray-500 hover:text-rose-500 transition-colors">
              <Heart className="h-5 w-5" strokeWidth={1.5} />
            </Link>

            <Link to="/cart" className="relative text-gray-500 hover:text-primary transition-colors">
              <ShoppingCart className="h-5 w-5" strokeWidth={1.5} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            <div className="hidden sm:block w-px h-5 bg-gray-200 mx-2" />

            <AnimatePresence mode="wait">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-gray-500 hover:text-primary transition-colors flex items-center gap-2">
                      <User className="h-5 w-5" strokeWidth={1.5} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-md rounded-xl border-gray-100 shadow-xl">
                    <div className="px-3 py-3">
                      <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate("/admin")} className="cursor-pointer">
                        <LayoutDashboard className="h-4 w-4 mr-2 text-gray-500" />
                        Trang quản trị
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      Tài khoản của tôi
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/wishlist")} className="cursor-pointer">
                      <Heart className="h-4 w-4 mr-2 text-gray-500" />
                      Sản phẩm yêu thích
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/orders")} className="cursor-pointer">
                      <ShoppingCart className="h-4 w-4 mr-2 text-gray-500" />
                      Đơn hàng của tôi
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-500 cursor-pointer">
                      <LogOut className="h-4 w-4 mr-2" />
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden sm:flex items-center gap-4">
                  <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-primary transition-colors">
                    Đăng nhập
                  </Link>
                  <Link to="/register">
                    <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 text-sm h-9">
                      Đăng ký
                    </Button>
                  </Link>
                </div>
              )}
            </AnimatePresence>

            <button 
              className="lg:hidden text-gray-500 hover:text-primary ml-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" strokeWidth={1.5} /> : <Menu className="h-6 w-6" strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="px-4 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-lg font-medium ${location.pathname === link.path ? 'text-primary' : 'text-gray-600'}`}
                >
                  {link.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-gray-100">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-center">Đăng nhập</Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full justify-center bg-primary">Đăng ký</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default AnimatedNavbar;
