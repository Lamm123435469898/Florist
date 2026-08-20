import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Package, User, Phone, Mail, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  finalTotal: number;
  status: string;
  createdAt: string;
  orderItems: OrderItem[];
}

function AdminOrdersContent() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await apiClient.get("/orders/admin?page=1&pageSize=100");
      if (data.success && data.data?.items) {
        setOrders(data.data.items);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Lỗi",
        description: "Không thể lấy danh sách đơn hàng",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { data } = await apiClient.put(`/orders/admin/${orderId}/status`, { status: newStatus });
      if (data.success) {
        toast({
          title: "Thành công",
          description: "Cập nhật trạng thái đơn hàng thành công",
        });
        fetchOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái đơn hàng",
        variant: "destructive",
      });
    }
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-purple-100 text-purple-800";
      case "shipped":
        return "bg-green-100 text-green-800";
      case "delivered":
        return "bg-emerald-100 text-emerald-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 font-sans">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Về Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Quản lý đơn hàng</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Đơn hàng ({orders.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => viewOrderDetails(order)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{order.customerName}</h3>
                        <p className="text-sm text-gray-600">Đơn #{order.id.slice(0, 8)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{order.finalTotal.toLocaleString("vi-VN")} ₫</p>
                        <span className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{order.customerEmail}</p>
                      <p>{order.customerPhone}</p>
                      <p>{new Date(order.createdAt).toLocaleString("vi-VN")}</p>
                    </div>
                  </div>
                ))}
              </div>

              {orders.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">Chưa có đơn hàng</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          {selectedOrder && (
            <Card>
              <CardHeader>
                <CardTitle>Chi tiết đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Khách hàng</h4>
                    <div className="space-y-1 text-sm">
                      <p className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {selectedOrder.customerName}
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {selectedOrder.customerEmail}
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {selectedOrder.customerPhone}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {selectedOrder.shippingAddress}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Cập nhật trạng thái</h4>
                    <Select
                      value={selectedOrder.status.toLowerCase()}
                      onValueChange={(value) => updateOrderStatus(selectedOrder.id, value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Sản phẩm</h4>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                      {selectedOrder.orderItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-2 border rounded">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.productName}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-secondary rounded flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-sm line-clamp-1">{item.productName}</p>
                            <p className="text-xs text-gray-600">
                              SL: {item.quantity} × {item.price.toLocaleString("vi-VN")} ₫
                            </p>
                          </div>
                          <p className="font-semibold text-sm">
                            {(item.quantity * item.price).toLocaleString("vi-VN")} ₫
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Tổng:</span>
                      <span className="text-xl font-bold text-accent">{selectedOrder.finalTotal.toLocaleString("vi-VN")} ₫</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    Ngày đặt: {new Date(selectedOrder.createdAt).toLocaleString("vi-VN")}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!selectedOrder && (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Chọn một đơn hàng để xem chi tiết</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminOrders() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminOrdersContent />
    </ProtectedRoute>
  );
}
