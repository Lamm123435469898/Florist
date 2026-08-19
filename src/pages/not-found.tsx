import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { AnimatedNavbar } from "@/components/animated-navbar";
import { AnimatedFooter } from "@/components/animated-footer";
import VerticalFlowerLine from "@/components/vertical-flower-line";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <VerticalFlowerLine />
      <AnimatedNavbar />
      <div className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="text-center max-w-md">
          <h1 className="text-7xl font-serif font-bold text-primary mb-6">404</h1>
          <h2 className="text-2xl font-serif font-bold text-foreground mb-4">Trang không tồn tại</h2>
          <p className="text-foreground/60 mb-8 text-sm leading-relaxed">
            Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </p>
          <Link to="/">
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-none px-8 h-12 tracking-wide">
              Trở về trang chủ
            </Button>
          </Link>
        </div>
      </div>
      <AnimatedFooter />
    </div>
  );
};

export default NotFound;
