import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatedNavbar } from "@/components/animated-navbar";
import { AnimatedFooter } from "@/components/animated-footer";
import { Button } from "@/components/ui/button";
import VerticalFlowerLine from "@/components/vertical-flower-line";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/contexts/cart-context";

const Cart = () => {
  const { items: cartItems, updateQuantity, removeItem, totalPrice, loading } = useCart();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    setUpdatingItems(prev => new Set(prev).add(id));
    await updateQuantity(id, newQuantity);
    setUpdatingItems(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleRemoveItem = async (id: string) => {
    setUpdatingItems(prev => new Set(prev).add(id));
    await removeItem(id);
    setUpdatingItems(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  if (loading && cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <VerticalFlowerLine />
        <AnimatedNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent"></div>
        </div>
        <AnimatedFooter />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background font-sans">
        <VerticalFlowerLine />
        <AnimatedNavbar />
        <section className="flex-1 flex items-center justify-center py-20 px-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-8 flex justify-center">
              <ShoppingBag className="h-16 w-16 text-foreground/20" strokeWidth={1} />
            </div>
            <h2 className="text-2xl font-serif font-bold text-foreground mb-4">
              Giỏ hàng trống
            </h2>
            <p className="text-foreground/60 mb-8 leading-relaxed text-sm">
              Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá các tác phẩm hoa khô tinh tế của chúng tôi.
            </p>
            <Link to="/products">
              <Button 
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white rounded-none px-8 h-12 tracking-wide"
              >
                Khám phá bộ sưu tập
              </Button>
            </Link>
          </div>
        </section>
        <AnimatedFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <VerticalFlowerLine />
      <AnimatedNavbar />

      {/* Page Header */}
      <section className="pt-32 pb-12 bg-secondary/10 border-b border-border">
        <div className="container mx-auto px-4 lg:px-[10%] text-center">
          <motion.h1 
            className="text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Giỏ Hàng
          </motion.h1>
        </div>
      </section>

      {/* Cart Content */}
      <section className="py-16 px-4 lg:px-[10%] flex-1">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
            
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-8">
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  className="flex flex-col sm:flex-row gap-6 pb-8 border-b border-border last:border-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <div className="w-24 h-32 sm:w-32 sm:h-40 bg-secondary/30 flex-shrink-0">
                    <img 
                      src={item.products?.image_url || "/placeholder.svg"} 
                      alt={item.products?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-serif font-bold text-lg text-foreground mb-1">
                          {item.products?.name}
                        </h3>
                      </div>
                      <button
                        className="text-foreground/40 hover:text-destructive transition-colors p-2 disabled:opacity-50"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={updatingItems.has(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center border border-border rounded-sm">
                        <button
                          className="w-8 h-8 flex items-center justify-center text-foreground/60 hover:text-primary transition-colors disabled:opacity-50"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={updatingItems.has(item.id)}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          className="w-8 h-8 flex items-center justify-center text-foreground/60 hover:text-primary transition-colors disabled:opacity-50"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={updatingItems.has(item.id)}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="font-medium text-accent">
                        {((item.products?.price || 0) * item.quantity).toLocaleString('vi-VN')} ₫
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <motion.div
              className="lg:col-span-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="bg-secondary/10 p-8 rounded-sm sticky top-24 border border-border">
                <h2 className="text-lg font-serif font-bold text-foreground mb-6">
                  Tổng đơn hàng
                </h2>
                <div className="space-y-4 mb-6 pb-6 border-b border-border">
                  <div className="flex justify-between text-sm text-foreground/70">
                    <span>Tạm tính ({cartItems.length} sản phẩm)</span>
                    <span className="font-medium text-foreground">
                      {totalPrice.toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-foreground/70">
                    <span>Phí vận chuyển</span>
                    <span className="font-medium text-foreground">
                      Miễn phí
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-lg font-bold text-foreground mb-8">
                  <span>Tổng cộng</span>
                  <span className="text-accent">
                    {totalPrice.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
                <Button 
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-white rounded-none h-12 tracking-wide mb-4"
                  onClick={() => navigate("/checkout")}
                >
                  Thanh toán
                </Button>
                <Link to="/products">
                  <Button 
                    variant="outline"
                    size="lg"
                    className="w-full rounded-none border-primary/20 text-primary hover:bg-primary/5 h-12 tracking-wide"
                  >
                    Tiếp tục mua sắm
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <AnimatedFooter />
    </div>
  );
};

export default Cart;
