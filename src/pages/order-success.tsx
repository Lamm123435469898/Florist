import { Link, useSearchParams } from "react-router-dom";
import { AnimatedNavbar } from "@/components/animated-navbar";
import { AnimatedFooter } from "@/components/animated-footer";
import VerticalFlowerLine from "@/components/vertical-flower-line";
import { Button } from "@/components/ui/button";
import { Check, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("id");

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <VerticalFlowerLine />
      <AnimatedNavbar />

      <main className="flex-1 flex items-center justify-center py-32 px-4">
        <motion.div 
          className="bg-white rounded-sm p-8 md:p-16 border border-border max-w-xl w-full text-center"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <Check className="w-10 h-10 text-primary" strokeWidth={1.5} />
          </motion.div>

          <h1 className="text-3xl font-serif font-bold text-foreground mb-4">
            Đặt hàng thành công
          </h1>
          
          <p className="text-foreground/70 mb-8 leading-relaxed text-sm">
            Cảm ơn bạn đã tin tưởng và mua sắm tại Florist. Đơn hàng của bạn đang được chuẩn bị cẩn thận và sẽ được giao trong thời gian sớm nhất.
          </p>

          {orderId && (
            <div className="bg-secondary/20 border border-border rounded-sm p-4 mb-10">
              <span className="text-xs text-foreground/50 block mb-1 uppercase tracking-wider">Mã đơn hàng</span>
              <span className="font-mono font-medium text-foreground text-lg break-all">{orderId}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/orders" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full rounded-none h-12 px-8 border-primary/20 text-primary hover:bg-primary/5 tracking-wide">
                Xem đơn hàng
              </Button>
            </Link>
            <Link to="/products" className="w-full sm:w-auto">
              <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-none h-12 px-8 tracking-wide">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Tiếp tục mua sắm
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>

      <AnimatedFooter />
    </div>
  );
}
