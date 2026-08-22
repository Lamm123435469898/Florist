import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { User, Phone, Mail, MapPin, Search, Package, Clock, Loader2, ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  imageUrl?: string | null;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  subTotal: number;
  discountAmount: number;
  finalTotal: number;
  status: string;
  paymentStatus?: string | null;
  paymentMethod?: string | null;
  paymentReference?: string | null;
  voucherCode?: string | null;
  notes?: string | null;
  shippingStatus?: string;
  carrier?: string | null;
  trackingNumber?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
  orderItems: OrderItem[];
}

const statusOptions = [
  { value: "pending", label: "Chờ xử lý" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "processing", label: "Đang xử lý" },
  { value: "shipped", label: "Đang giao" },
  { value: "delivered", label: "Đã giao" }
];

function getStatusColor(status: string) {
  const map: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    confirmed: "bg-blue-50 text-blue-700 border-blue-200",
    processing: "bg-purple-50 text-purple-700 border-purple-200",
    shipped: "bg-teal-50 text-teal-700 border-teal-200",
    delivered: "bg-green-50 text-green-700 border-green-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
  };
  return map[status.toLowerCase()] || "bg-gray-100 text-gray-700 border-gray-200";
}

function getStatusLabel(status: string) {
  const option = statusOptions.find((o) => o.value === status.toLowerCase());
  return option ? option.label : status;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/orders/admin?page=1&pageSize=100");
      if (data.success && data.data?.items) {
        setOrders(data.data.items);
      }
    } catch (error) {
      toast.error("Không thể lấy danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { data } = await apiClient.put(`/orders/admin/${orderId}/status`, { status: newStatus });
      if (data.success) {
        toast.success("Đã cập nhật trạng thái đơn hàng");
        fetchOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Không thể cập nhật trạng thái");
    }
  };

  const updateShippingStatus = async (orderId: string, payload: { shippingStatus: string; carrier?: string; trackingNumber?: string }) => {
    try {
      const { data } = await apiClient.put(`/orders/admin/${orderId}/shipping`, payload);
      if (data.success) {
        toast.success("Đã cập nhật trạng thái giao hàng");
        fetchOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, ...payload });
        }
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Không thể cập nhật trạng thái giao hàng");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout title="Quản lý đơn hàng">
      <div className={`flex gap-6 ${selectedOrder ? "lg:gap-8" : ""}`}>
        {/* Main Orders List */}
        <div className="flex-1 min-w-0">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo tên, SĐT, mã đơn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(154,35%,30%)]/20 focus:border-[hsl(154,35%,30%)]/40 transition-all"
              />
            </div>
            <div className="w-full sm:w-48 flex-shrink-0">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full h-[42px] bg-white border-gray-200 rounded-lg">
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-[hsl(154,35%,30%)] mx-auto mb-3" />
                <p className="text-sm text-gray-400">Đang tải đơn hàng...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-16 text-center">
                <Package className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                <p className="text-sm text-gray-400">Không tìm thấy đơn hàng nào</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <div>Khách hàng</div>
                  <div className="w-32 text-right">Tổng tiền</div>
                  <div className="w-28 text-center">Trạng thái</div>
                  <div className="w-8"></div>
                </div>

                <div className="divide-y divide-gray-50">
                  {filteredOrders.map((order, idx) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      onClick={() => setSelectedOrder(order)}
                      className={`grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-4 items-center cursor-pointer transition-colors ${
                        selectedOrder?.id === order.id ? "bg-[hsl(154,35%,30%)]/5" : "hover:bg-gray-50/70"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{order.customerName}</p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">#{order.id.slice(0, 8).toUpperCase()}</p>
                      </div>

                      <div className="w-32 text-right">
                        <p className="text-sm font-semibold text-gray-800">{order.finalTotal.toLocaleString("vi-VN")} ₫</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString("vi-VN")}</p>
                      </div>

                      <div className="w-28 text-center">
                        <span className={`inline-block px-2.5 py-0.5 border rounded-full text-[11px] font-medium whitespace-nowrap ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>

                      <div className="w-8 flex justify-end">
                        <ArrowRight className={`h-4 w-4 transition-colors ${selectedOrder?.id === order.id ? "text-[hsl(154,35%,30%)]" : "text-gray-300"}`} />
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
                  {filteredOrders.length} / {orders.length} đơn hàng
                </div>
              </>
            )}
          </div>
        </div>

        {/* Order Details Panel */}
        <AnimatePresence>
          {selectedOrder && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-50 flex lg:static lg:inset-auto lg:z-auto w-full lg:w-[400px] flex-shrink-0"
            >
              <div className="fixed inset-0 bg-black/40 lg:hidden" onClick={() => setSelectedOrder(null)} />
              
              <div className="relative ml-auto lg:ml-0 w-full max-w-md lg:max-w-none bg-white lg:bg-transparent shadow-2xl lg:shadow-none h-full lg:h-auto overflow-y-auto lg:overflow-visible">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 lg:sticky lg:top-6 min-h-[calc(100vh-3rem)] lg:min-h-0">
                  <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-100">
                    <div>
                      <h2 className="font-semibold text-gray-900 text-lg">Chi tiết đơn hàng</h2>
                      <p className="text-xs text-gray-400 font-mono mt-1">#{selectedOrder.id.toUpperCase()}</p>
                    </div>
                    <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 p-1.5 rounded-md">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Status Update */}
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Cập nhật trạng thái</h3>
                      <Select
                        value={selectedOrder.status.toLowerCase()}
                        onValueChange={(val) => updateOrderStatus(selectedOrder.id, val)}
                      >
                        <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Shipping Tracking Update */}
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Thông tin giao hàng</h3>
                      <div className="space-y-3">
                        <Select
                          value={selectedOrder.shippingStatus?.toLowerCase() || 'pending'}
                          onValueChange={(val) => updateShippingStatus(selectedOrder.id, { shippingStatus: val })}
                        >
                          <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                            <SelectValue placeholder="Trạng thái giao hàng" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Chờ xử lý</SelectItem>
                            <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                            <SelectItem value="processing">Đang đóng gói</SelectItem>
                            <SelectItem value="shipping">Đang giao hàng</SelectItem>
                            <SelectItem value="delivered">Đã giao thành công</SelectItem>
                            <SelectItem value="cancelled">Đã hủy</SelectItem>
                            <SelectItem value="returned">Hoàn trả</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Đơn vị vận chuyển (VD: VNPost, J&T...)"
                            className="w-1/2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[hsl(154,35%,30%)]"
                            defaultValue={selectedOrder.carrier || ''}
                            onBlur={(e) => {
                              if (e.target.value !== selectedOrder.carrier) {
                                updateShippingStatus(selectedOrder.id, { shippingStatus: selectedOrder.shippingStatus || 'pending', carrier: e.target.value, trackingNumber: selectedOrder.trackingNumber || '' });
                              }
                            }}
                          />
                          <input
                            type="text"
                            placeholder="Mã vận đơn (Tracking)"
                            className="w-1/2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[hsl(154,35%,30%)] font-mono"
                            defaultValue={selectedOrder.trackingNumber || ''}
                            onBlur={(e) => {
                              if (e.target.value !== selectedOrder.trackingNumber) {
                                updateShippingStatus(selectedOrder.id, { shippingStatus: selectedOrder.shippingStatus || 'pending', carrier: selectedOrder.carrier || '', trackingNumber: e.target.value });
                              }
                            }}
                          />
                        </div>
                        {(selectedOrder.shippedAt || selectedOrder.deliveredAt) && (
                          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded-md border border-gray-100">
                            {selectedOrder.shippedAt && <div>Gửi hàng: {new Date(selectedOrder.shippedAt).toLocaleString('vi-VN')}</div>}
                            {selectedOrder.deliveredAt && <div>Đã giao: {new Date(selectedOrder.deliveredAt).toLocaleString('vi-VN')}</div>}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Thông tin khách hàng</h3>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <User className="h-4 w-4 text-gray-400 mt-0.5" />
                          <span className="text-sm font-medium text-gray-900">{selectedOrder.customerName}</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                          <span className="text-sm text-gray-600">{selectedOrder.customerPhone}</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
                          <span className="text-sm text-gray-600">{selectedOrder.customerEmail}</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                          <span className="text-sm text-gray-600">{selectedOrder.shippingAddress}</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Sản phẩm</h3>
                      <div className="space-y-3">
                        {selectedOrder.orderItems.map((item) => (
                          <div key={item.id} className="flex gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.productName} className="w-12 h-12 object-cover rounded-md flex-shrink-0" />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-gray-400 flex-shrink-0">
                                <Package className="h-5 w-5" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 truncate">{item.productName}</h4>
                              <p className="text-xs text-gray-500 mt-0.5">Số lượng: {item.quantity}</p>
                              <p className="text-sm font-semibold text-[hsl(154,35%,30%)] mt-1">{item.price.toLocaleString('vi-VN')} ₫</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Payment Info & Notes */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      {selectedOrder.notes && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Ghi chú của khách hàng</p>
                          <p className="text-sm text-gray-900">{selectedOrder.notes}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Thanh toán</p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedOrder.paymentMethod === 'VNPAY' ? 'VNPay' : selectedOrder.paymentMethod === 'MOMO' ? 'MoMo' : 'Tiền mặt (COD)'} 
                          <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${selectedOrder.paymentStatus === 'COMPLETED' ? 'bg-green-100 text-green-700' : selectedOrder.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                            {selectedOrder.paymentStatus === 'COMPLETED' ? 'Đã thanh toán' : selectedOrder.paymentStatus === 'FAILED' ? 'Thất bại' : 'Chờ thanh toán'}
                          </span>
                        </p>
                        {selectedOrder.paymentReference && <p className="text-xs text-gray-500 mt-1 font-mono">Ref: {selectedOrder.paymentReference}</p>}
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="border-t border-gray-100 pt-4 space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Tạm tính</span>
                        <span>{selectedOrder.subTotal ? selectedOrder.subTotal.toLocaleString("vi-VN") : selectedOrder.finalTotal.toLocaleString("vi-VN")} ₫</span>
                      </div>
                      {selectedOrder.discountAmount > 0 && (
                        <div className="flex justify-between text-sm text-[hsl(154,35%,30%)]">
                          <span>Giảm giá {selectedOrder.voucherCode ? `(${selectedOrder.voucherCode})` : ''}</span>
                          <span>-{selectedOrder.discountAmount.toLocaleString("vi-VN")} ₫</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Phí giao hàng</span>
                        <span>0 ₫</span>
                      </div>
                      <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
                        <span>Tổng cộng</span>
                        <span className="text-[hsl(154,35%,30%)]">{selectedOrder.finalTotal.toLocaleString("vi-VN")} ₫</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1">
                      <Clock className="h-3 w-3" />
                      Đặt lúc: {new Date(selectedOrder.createdAt).toLocaleString("vi-VN")}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
