import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { AdminLayout } from "@/components/admin-layout";
import { useNavigate } from "react-router-dom";
import { Package, ShoppingCart, Users, TrendingUp, ArrowRight, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
}

interface RecentOrder {
  id: string;
  customerName: string;
  finalTotal: number;
  status: string;
  createdAt: string;
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`h-10 w-10 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </motion.div>
  );
}

function getStatusBadge(status: string) {
  const map: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border border-amber-200",
    confirmed: "bg-blue-50 text-blue-700 border border-blue-200",
    processing: "bg-purple-50 text-purple-700 border border-purple-200",
    shipped: "bg-teal-50 text-teal-700 border border-teal-200",
    delivered: "bg-green-50 text-green-700 border border-green-200",
    cancelled: "bg-red-50 text-red-700 border border-red-200",
  };
  const statusLabel: Record<string, string> = {
    pending: "Chờ xử lý",
    confirmed: "Đã xác nhận",
    processing: "Đang xử lý",
    shipped: "Đang giao",
    delivered: "Đã giao",
    cancelled: "Đã hủy",
  };
  const key = status.toLowerCase();
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[key] ?? "bg-gray-100 text-gray-600"}`}>
      {statusLabel[key] ?? status}
    </span>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentOrders();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await apiClient.get("/admin/dashboard/stats");
      if (data.success && data.data) {
        setStats({
          totalProducts: data.data.totalProducts || 0,
          totalOrders: data.data.totalOrders || 0,
          totalUsers: data.data.totalUsers || 0,
          totalRevenue: data.data.totalRevenue || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const { data } = await apiClient.get("/orders/admin?page=1&pageSize=5");
      if (data.success && data.data?.items) {
        setRecentOrders(data.data.items.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching recent orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const statCards = [
    {
      icon: TrendingUp,
      label: "Doanh thu",
      value: loadingStats ? "—" : `${stats.totalRevenue.toLocaleString("vi-VN")} ₫`,
      color: "bg-[hsl(154,35%,30%)]",
      delay: 0,
    },
    {
      icon: ShoppingCart,
      label: "Tổng đơn hàng",
      value: loadingStats ? "—" : stats.totalOrders,
      color: "bg-[hsl(350,45%,55%)]",
      delay: 0.05,
    },
    {
      icon: Package,
      label: "Sản phẩm",
      value: loadingStats ? "—" : stats.totalProducts,
      color: "bg-blue-500",
      delay: 0.1,
    },
    {
      icon: Users,
      label: "Người dùng",
      value: loadingStats ? "—" : stats.totalUsers,
      color: "bg-purple-500",
      delay: 0.15,
    },
  ];

  return (
    <AdminLayout title="Dashboard">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Recent Orders + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <h2 className="font-semibold text-gray-800">Đơn hàng gần đây</h2>
            </div>
            <button
              onClick={() => navigate("/admin/orders")}
              className="flex items-center gap-1 text-sm text-[hsl(154,35%,30%)] hover:text-[hsl(154,35%,20%)] font-medium transition-colors"
            >
              Xem tất cả <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {loadingOrders ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-gray-50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <ShoppingCart className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Chưa có đơn hàng nào</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/70 transition-colors cursor-pointer"
                  onClick={() => navigate("/admin/orders")}
                >
                  <div className="h-9 w-9 rounded-lg bg-[hsl(40,20%,95%)] flex items-center justify-center flex-shrink-0">
                    <ShoppingCart className="h-4 w-4 text-[hsl(154,35%,30%)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{order.customerName}</p>
                    <p className="text-xs text-gray-400 font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-gray-800">{order.finalTotal.toLocaleString("vi-VN")} ₫</p>
                    <div className="mt-1">{getStatusBadge(order.status)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
        >
          <h2 className="font-semibold text-gray-800 mb-5">Thao tác nhanh</h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/admin/products")}
              className="w-full flex items-center gap-3 p-3.5 rounded-lg bg-[hsl(40,20%,97%)] hover:bg-[hsl(40,20%,94%)] border border-transparent hover:border-[hsl(40,15%,88%)] transition-all text-left group"
            >
              <div className="h-8 w-8 rounded-md bg-[hsl(154,35%,30%)] flex items-center justify-center">
                <Package className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Thêm sản phẩm</p>
                <p className="text-xs text-gray-400">Tạo sản phẩm mới</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 ml-auto group-hover:text-gray-500 transition-colors" />
            </button>

            <button
              onClick={() => navigate("/admin/orders")}
              className="w-full flex items-center gap-3 p-3.5 rounded-lg bg-[hsl(40,20%,97%)] hover:bg-[hsl(40,20%,94%)] border border-transparent hover:border-[hsl(40,15%,88%)] transition-all text-left group"
            >
              <div className="h-8 w-8 rounded-md bg-[hsl(350,45%,55%)] flex items-center justify-center">
                <ShoppingCart className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Xử lý đơn hàng</p>
                <p className="text-xs text-gray-400">Cập nhật trạng thái</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 ml-auto group-hover:text-gray-500 transition-colors" />
            </button>

            <button
              onClick={() => navigate("/")}
              className="w-full flex items-center gap-3 p-3.5 rounded-lg bg-[hsl(40,20%,97%)] hover:bg-[hsl(40,20%,94%)] border border-transparent hover:border-[hsl(40,15%,88%)] transition-all text-left group"
            >
              <div className="h-8 w-8 rounded-md bg-blue-500 flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Xem cửa hàng</p>
                <p className="text-xs text-gray-400">Trang khách hàng</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 ml-auto group-hover:text-gray-500 transition-colors" />
            </button>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
