import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, Search, MapPin, Phone, Mail, User, LogOut, LayoutDashboard, Heart } from "lucide-react";
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

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, signOut } = useAuth();
  const { totalItems } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "Đã đăng xuất" });
    navigate("/");
  };

  return (
    <header className="bg-primary">
      {/* Top Bar */}
      <div className="bg-primary/95 text-white text-xs py-2 px-4 lg:px-[10%]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3" />
            <span>HoChiMinh, Viet Nam</span>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3" />
              <span>+84 929 297 939</span>
            </div>
            <span className="text-white/50">|</span>
            <div className="flex items-center gap-2">
              <Mail className="h-3 w-3" />
              <span>floristhcm@gmail.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="px-4 lg:px-[10%] py-3">
        <div className="bg-white rounded-[40px] px-6 py-3 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img 
              src="https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100034954/66ed.jpg" 
              alt="Florist" 
              className="h-10 w-10 rounded-full object-cover"
            />
            <span className="text-xl font-bold text-primary">Florist</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-7">
            <Link 
              to="/" 
              className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
            >
              Trang chủ
            </Link>
            <Link 
              to="/products" 
              className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
            >
              Sản phẩm
            </Link>
            <Link 
              to="/about" 
              className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
            >
              Về chúng tôi
            </Link>
            <Link 
              to="/contact" 
              className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
            >
              Liên hệ
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link to="/wishlist" className="relative text-muted-foreground hover:text-rose-500 transition-colors">
              <Heart className="h-5 w-5" />
            </Link>
            <Link to="/cart" className="relative text-muted-foreground hover:text-primary transition-colors">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {totalItems}
              </span>
            </Link>
            <Button 
              size="icon" 
              className="rounded-full h-9 w-9 bg-accent hover:bg-primary text-white"
            >
              <Search className="h-4 w-4" />
            </Button>
            
            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    size="icon" 
                    className="rounded-full h-9 w-9 bg-primary hover:bg-primary/90 text-white"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-3 py-2 text-sm font-medium">
                    {user?.email}
                  </div>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate("/admin")}>
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => navigate("/cart")}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Giỏ hàng
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="h-4 w-4 mr-2" />
                    Tài khoản của tôi
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/orders")}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Đơn hàng của tôi
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/wishlist")}>
                    <Heart className="h-4 w-4 mr-2" />
                    Sản phẩm yêu thích
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-primary hover:text-primary/80"
                  >
                    Đăng nhập
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-white rounded-full"
                  >
                    Đăng ký
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
