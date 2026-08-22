import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AnimatedNavbar } from "@/components/animated-navbar";
import { AnimatedFooter } from "@/components/animated-footer";
import VerticalFlowerLine from "@/components/vertical-flower-line";
import { useAuth } from "@/contexts/auth-context";
import { apiClient } from "@/lib/api-client";
import { Package, Clock, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  products?: {
    name: string;
    image_url: string | null;
  };
}

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  payment_method?: string;
  payment_status?: string;
  order_items?: OrderItem[];
}

export default function Orders() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/orders/my?page=1&pageSize=50");
      if (data.success && data.data?.items) {
        const mappedOrders = data.data.items.map((o: any) => ({
          id: o.id,
          created_at: o.createdAt,
          total_amount: o.finalTotal,
          status: o.status.toLowerCase(),
          payment_method: o.paymentMethod,
          payment_status: o.paymentStatus,
          order_items: (o.orderItems || []).map((item: any) => ({
            id: item.id,
            quantity: item.quantity,
            price: item.price,
            products: {
              name: item.productName,
              image_url: null // Backend OrderItemDto doesn't include image yet
            }
          }))
        }));
        setOrders(mappedOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) return;
    
    try {
      const { data } = await apiClient.post(`/orders/${orderId}/cancel`);
      if (data.success) {
        toast.success("Đã hủy đơn hàng thành công");
        fetchOrders(); // Refresh
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể hủy đơn hàng");
    }
  };

  const handlePayNow = async (orderId: string) => {
    try {
      setLoading(true);
      const paymentRes = await apiClient.post("/payments/create", {
        orderId: orderId,
        paymentMethod: "SEPAY"
      });
      
      if (paymentRes.data.success) {
        navigate(`/payment?id=${orderId}`, { 
          state: { paymentData: paymentRes.data.data }
        });
      } else {
        toast.error("Không thể tạo phiên thanh toán mới");
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi tạo thanh toán");
      setLoading(false);
    }
  };

  if (authLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-accent" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-primary" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-destructive" />;
      default: return <Package className="w-4 h-4 text-foreground/50" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Đang xử lý';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <VerticalFlowerLine />
      <AnimatedNavbar />

      <main className="flex-1 py-32 px-4 lg:px-[10%] container mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-3xl lg:text-4xl font-serif font-bold text-foreground mb-4">Lịch sử đơn hàng</h1>
          <p className="text-foreground/60 text-sm">Quản lý và theo dõi các đơn hàng bạn đã đặt.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-sm p-16 text-center border border-border">
            <div className="w-16 h-16 bg-secondary/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-8 h-8 text-foreground/30" strokeWidth={1} />
            </div>
            <h2 className="text-xl font-serif font-bold text-foreground mb-2">Chưa có đơn hàng nào</h2>
            <p className="text-foreground/60 text-sm">Bạn chưa thực hiện giao dịch mua hàng nào tại Florist.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order, index) => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-sm border border-border overflow-hidden"
              >
                {/* Header đơn hàng */}
                <div className="border-b border-border p-6 flex flex-wrap items-center justify-between gap-4 bg-secondary/10">
                  <div className="space-y-2">
                    <p className="text-xs text-foreground/50 uppercase tracking-wider">
                      Mã đơn hàng: <span className="font-mono text-foreground font-medium ml-2">{order.id}</span>
                    </p>
                    <p className="text-sm text-foreground/70">
                      Ngày đặt: {new Date(order.created_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-sm border border-border">
                    {getStatusIcon(order.status)}
                    <span className="font-medium text-sm text-foreground">{getStatusText(order.status)}</span>
                  </div>
                </div>

                {/* Danh sách sản phẩm */}
                <div className="p-6">
                  <div className="space-y-6">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="flex gap-6 items-center">
                        <div className="w-16 h-20 bg-secondary/30 rounded-sm overflow-hidden flex-shrink-0">
                          <img 
                            src={item.products?.image_url || "/placeholder.svg"} 
                            alt={item.products?.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-serif font-medium text-foreground line-clamp-1">{item.products?.name}</h4>
                          <div className="text-sm text-foreground/50 mt-1">
                            {item.price.toLocaleString('vi-VN')} ₫ <span className="mx-2">x</span> {item.quantity}
                          </div>
                        </div>
                        <div className="font-medium text-accent">
                          {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tổng kết */}
                <div className="bg-secondary/5 p-6 flex flex-col sm:flex-row justify-between items-center border-t border-border gap-4">
                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <Button 
                        variant="outline" 
                        className="text-destructive border-destructive hover:bg-destructive hover:text-white"
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        Hủy đơn hàng
                      </Button>
                    )}
                    {order.status === 'pending' && order.payment_method === 'SEPAY' && order.payment_status !== 'COMPLETED' && (
                      <Button 
                        variant="default"
                        className="bg-[hsl(154,35%,30%)] hover:bg-[hsl(154,35%,25%)] text-white"
                        onClick={() => handlePayNow(order.id)}
                      >
                        Thanh toán ngay
                      </Button>
                    )}
                  </div>
                  <div className="text-right flex items-center gap-6">
                    <span className="text-foreground/70 text-sm">Tổng cộng:</span>
                    <span className="text-2xl font-bold text-accent">
                      {order.total_amount.toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <AnimatedFooter />
    </div>
  );
}
