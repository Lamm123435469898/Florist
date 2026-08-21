import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatedNavbar } from "@/components/animated-navbar";
import { AnimatedFooter } from "@/components/animated-footer";
import VerticalFlowerLine from "@/components/vertical-flower-line";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Checkout() {
  const { items, totalPrice, clearCart, loading: cartLoading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: user?.email || "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (!cartLoading && items.length === 0) {
      navigate("/cart");
    }
  }, [items.length, cartLoading, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Vui lòng đăng nhập để đặt hàng.");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      const { data } = await apiClient.post("/orders", {
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: formData.address,
        paymentMethod: "COD"
      });

      if (data.success) {
        // Our backend API probably clears the cart automatically upon order creation.
        // We will just fetch cart items again to clear the local state, or clearCart locally.
        await clearCart(); 
        toast.success("Đặt hàng thành công");
        navigate(`/order-success?id=${data.data.id}`);
      } else {
        throw new Error(data.message || "Failed to place order");
      }
    } catch (error: any) {
      // Global error handler takes care of displaying the error message
    } finally {
      setLoading(false);
    }
  };

  if (cartLoading) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <VerticalFlowerLine />
      <AnimatedNavbar />

      <main className="flex-1 py-32 px-4 lg:px-[10%] container mx-auto">
        <h1 className="text-3xl lg:text-4xl font-serif font-bold text-foreground mb-12 text-center">Thanh toán</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Cột trái: Form điền thông tin */}
          <div>
            <div className="bg-white rounded-sm p-8 shadow-sm border border-border">
              <h2 className="text-xl font-serif font-bold text-foreground mb-8">Thông tin giao hàng</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground/80">Họ và tên</Label>
                  <Input 
                    id="name" 
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Nhập họ và tên người nhận" 
                    className="rounded-sm border-border focus-visible:ring-primary/20"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground/80">Email</Label>
                    <Input 
                      id="email" 
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Nhập email" 
                      className="rounded-sm border-border focus-visible:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-foreground/80">Số điện thoại</Label>
                    <Input 
                      id="phone" 
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Nhập số điện thoại" 
                      className="rounded-sm border-border focus-visible:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-foreground/80">Địa chỉ giao hàng</Label>
                  <Textarea 
                    id="address" 
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Nhập địa chỉ giao hàng chi tiết"
                    rows={4} 
                    className="rounded-sm border-border focus-visible:ring-primary/20 resize-none"
                  />
                </div>

                {/* Phương thức thanh toán - Giả lập COD */}
                <div className="pt-6 border-t border-border mt-6">
                  <h3 className="font-medium text-foreground mb-4 text-sm">Phương thức thanh toán</h3>
                  <div className="bg-secondary/20 border border-border p-4 rounded-sm flex items-center justify-between">
                    <span className="text-sm text-foreground/80">Thanh toán khi nhận hàng (COD)</span>
                    <div className="w-4 h-4 rounded-full border-[3px] border-primary flex-shrink-0"></div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-base rounded-none tracking-wide mt-8"
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang xử lý...</>
                  ) : (
                    "Hoàn Tất Đặt Hàng"
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* Cột phải: Tổng kết đơn hàng */}
          <div>
            <div className="bg-secondary/10 border border-border rounded-sm p-8 sticky top-32">
              <h2 className="text-xl font-serif font-bold text-foreground mb-8">Tóm tắt đơn hàng</h2>
              
              <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="h-20 w-16 bg-secondary/30 rounded-sm overflow-hidden flex-shrink-0">
                      <img 
                        src={item.products?.image_url || "https://via.placeholder.com/150"} 
                        alt={item.products?.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <h4 className="font-serif font-medium text-sm text-foreground line-clamp-1">{item.products?.name}</h4>
                        <div className="text-foreground/50 text-xs mt-1">Số lượng: {item.quantity}</div>
                      </div>
                      <div className="font-medium text-accent text-sm">
                        {((item.products?.price || 0) * item.quantity).toLocaleString('vi-VN')} ₫
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-border">
                <div className="flex justify-between text-sm text-foreground/70">
                  <span>Tạm tính ({items.length} sản phẩm)</span>
                  <span className="font-medium text-foreground">{totalPrice.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex justify-between text-sm text-foreground/70">
                  <span>Phí vận chuyển</span>
                  <span className="font-medium text-foreground">Miễn phí</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-6 border-t border-border text-foreground">
                  <span>Tổng thanh toán</span>
                  <span className="text-accent">{totalPrice.toLocaleString('vi-VN')} ₫</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AnimatedFooter />
    </div>
  );
}
