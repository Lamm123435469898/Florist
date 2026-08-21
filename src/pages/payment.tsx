import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatedNavbar } from "@/components/animated-navbar";
import { AnimatedFooter } from "@/components/animated-footer";
import VerticalFlowerLine from "@/components/vertical-flower-line";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, RefreshCw, CheckCircle2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { motion } from "framer-motion";

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("id");
  
  const paymentData = location.state?.paymentData;
  const [isPolling, setIsPolling] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string>("PENDING");
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const maxPollsRef = useRef(60);

  useEffect(() => {
    if (!orderId || !paymentData) {
      toast.error("Không tìm thấy thông tin thanh toán.");
      navigate("/orders");
    }
    
    return () => {
      stopPolling();
    };
  }, [orderId, paymentData, navigate]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label}`);
  };

  const startPolling = () => {
    if (isPolling) return;
    setIsPolling(true);
    maxPollsRef.current = 60;
    toast.info("Hệ thống đang kiểm tra thanh toán của bạn...");
    
    pollTimerRef.current = setInterval(async () => {
      if (maxPollsRef.current <= 0) {
        stopPolling();
        toast.error("Chưa nhận được xác nhận thanh toán. Vui lòng chờ hệ thống cập nhật.");
        return;
      }
      
      try {
        const { data } = await apiClient.get(`/payments/${orderId}/status`);
        if (data.success) {
          setPaymentStatus(data.status);
          if (data.status === "PAID") {
            stopPolling();
            toast.success("Thanh toán đã được xác nhận.");
            setTimeout(() => {
              navigate(`/order-success?id=${orderId}`);
            }, 1500);
          }
        }
      } catch (error) {
        console.error("Error polling payment status", error);
      }
      maxPollsRef.current -= 1;
    }, 2000);
  };

  const stopPolling = () => {
    setIsPolling(false);
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  if (!paymentData) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <VerticalFlowerLine />
      <AnimatedNavbar />

      <main className="flex-1 flex items-center justify-center py-32 px-4">
        <motion.div 
          className="bg-white rounded-sm p-8 md:p-12 border border-border max-w-2xl w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-serif font-bold text-center text-foreground mb-6">
            Thanh toán chuyển khoản
          </h1>
          
          <p className="text-center text-foreground/70 mb-8 text-sm">
            Quét mã QR bằng ứng dụng ngân hàng của bạn hoặc chuyển khoản theo thông tin bên dưới.
          </p>

          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-8">
            <div className="w-64 h-64 border rounded-sm overflow-hidden flex-shrink-0 bg-secondary/10 flex items-center justify-center p-2">
              {paymentData.paymentUrl ? (
                <img src={paymentData.paymentUrl} alt="VietQR" className="w-full h-full object-contain" />
              ) : (
                <div className="text-sm text-foreground/50">Không thể tải mã QR</div>
              )}
            </div>
            
            <div className="flex-1 w-full space-y-4">
              <div className="bg-secondary/10 p-4 rounded-sm border border-border space-y-4">
                <div>
                  <div className="text-xs text-foreground/50 mb-1">Ngân hàng</div>
                  <div className="font-medium text-foreground">{paymentData.bankName}</div>
                </div>
                
                <div>
                  <div className="text-xs text-foreground/50 mb-1">Chủ tài khoản</div>
                  <div className="font-medium text-foreground">{paymentData.accountName}</div>
                </div>
                
                <div>
                  <div className="text-xs text-foreground/50 mb-1">Số tài khoản</div>
                  <div className="flex items-center justify-between">
                    <div className="font-mono font-medium text-lg text-primary">{paymentData.accountNumber}</div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(paymentData.accountNumber, "số tài khoản")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-foreground/50 mb-1">Số tiền</div>
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-accent font-serif text-lg">{paymentData.amount?.toLocaleString('vi-VN')} ₫</div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(paymentData.amount?.toString() || "", "số tiền")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-foreground/50 mb-1">Nội dung chuyển khoản (Bắt buộc)</div>
                  <div className="flex items-center justify-between">
                    <div className="font-mono font-bold text-primary">{paymentData.paymentReference}</div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(paymentData.paymentReference || "", "nội dung chuyển khoản")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center p-4 bg-amber-50 text-amber-800 rounded-sm mb-8 text-sm font-medium border border-amber-200">
            Vui lòng chuyển đúng số tiền và giữ nguyên nội dung chuyển khoản để hệ thống xác nhận tự động.
          </div>

          <div className="flex flex-col gap-4">
            <Button 
              onClick={startPolling}
              disabled={isPolling || paymentStatus === "PAID"}
              className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-base rounded-none tracking-wide"
            >
              {paymentStatus === "PAID" ? (
                <><CheckCircle2 className="mr-2 h-5 w-5" /> Thanh toán thành công</>
              ) : isPolling ? (
                <><RefreshCw className="mr-2 h-5 w-5 animate-spin" /> Đang kiểm tra giao dịch...</>
              ) : (
                "Tôi đã chuyển khoản"
              )}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate("/orders")}
              disabled={isPolling && paymentStatus !== "PAID"}
              className="w-full rounded-none h-12 text-primary border-primary/20"
            >
              Thanh toán sau
            </Button>
          </div>
        </motion.div>
      </main>

      <AnimatedFooter />
    </div>
  );
}
