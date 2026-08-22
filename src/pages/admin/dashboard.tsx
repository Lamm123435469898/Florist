import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { AdminLayout } from "@/components/admin-layout";
import { Loader2, TrendingUp, Users, ShoppingBag, DollarSign, Package } from "lucide-react";
import { toast } from "sonner";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface RevenueByDate {
  date: string;
  revenue: number;
}

interface TopProduct {
  productName: string;
  totalSold: number;
  totalRevenue: number;
}

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  todayRevenue: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  revenueByDate: RevenueByDate[];
  topProducts: TopProduct[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await apiClient.get("/admin/dashboard/stats");
      if (data.success) {
        setStats(data.data);
      }
    } catch {
      toast.error("Không thể tải dữ liệu thống kê");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Tổng quan">
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(154,35%,30%)]" />
        </div>
      </AdminLayout>
    );
  }

  if (!stats) return null;

  return (
    <AdminLayout title="Tổng quan">
      <div className="space-y-6">
        
        {/* Main Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <DollarSign className="w-16 h-16" />
            </div>
            <p className="text-sm font-medium text-gray-500 mb-2">Doanh thu hôm nay</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.todayRevenue?.toLocaleString("vi-VN") || 0} ₫</h3>
            <p className="text-xs text-[hsl(154,35%,30%)] mt-2 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Cập nhật liên tục
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <DollarSign className="w-16 h-16" />
            </div>
            <p className="text-sm font-medium text-gray-500 mb-2">Tổng doanh thu</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalRevenue?.toLocaleString("vi-VN") || 0} ₫</h3>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <ShoppingBag className="w-16 h-16" />
            </div>
            <p className="text-sm font-medium text-gray-500 mb-2">Tổng đơn hàng</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalOrders}</h3>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Users className="w-16 h-16" />
            </div>
            <p className="text-sm font-medium text-gray-500 mb-2">Tổng khách hàng</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalUsers}</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Revenue Chart */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Doanh thu 7 ngày qua</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.revenueByDate || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(154, 35%, 30%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(154, 35%, 30%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} 
                         tickFormatter={(val) => {
                           if (!val) return "";
                           const d = new Date(val);
                           return `${d.getDate()}/${d.getMonth()+1}`;
                         }} 
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} 
                         tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`${value.toLocaleString('vi-VN')} ₫`, 'Doanh thu']}
                    labelFormatter={(label) => label ? new Date(label).toLocaleDateString('vi-VN') : ""}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(154, 35%, 30%)" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Order Status Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Tình trạng đơn hàng</h3>
            <div className="flex-1 flex flex-col justify-center space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-orange-50 border border-orange-100">
                <span className="text-sm font-medium text-orange-700">Chờ xử lý</span>
                <span className="text-lg font-bold text-orange-700">{stats.pendingOrders || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-100">
                <span className="text-sm font-medium text-blue-700">Đang đóng gói</span>
                <span className="text-lg font-bold text-blue-700">{stats.processingOrders || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50 border border-purple-100">
                <span className="text-sm font-medium text-purple-700">Đang giao hàng</span>
                <span className="text-lg font-bold text-purple-700">{stats.shippedOrders || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-100">
                <span className="text-sm font-medium text-green-700">Đã giao thành công</span>
                <span className="text-lg font-bold text-green-700">{stats.deliveredOrders || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Sản phẩm bán chạy nhất</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 bg-gray-50 uppercase font-medium border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3">Sản phẩm</th>
                  <th className="px-5 py-3 text-right">Đã bán</th>
                  <th className="px-5 py-3 text-right">Doanh thu mang lại</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(stats.topProducts || []).map((p, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex flex-shrink-0 items-center justify-center text-gray-400">
                        <Package className="w-4 h-4" />
                      </div>
                      <span className="truncate max-w-[300px]">{p.productName}</span>
                    </td>
                    <td className="px-5 py-3 text-right font-medium">{p.totalSold}</td>
                    <td className="px-5 py-3 text-right font-semibold text-[hsl(154,35%,30%)]">{p.totalRevenue.toLocaleString('vi-VN')} ₫</td>
                  </tr>
                ))}
                {(!stats.topProducts || stats.topProducts.length === 0) && (
                  <tr>
                    <td colSpan={3} className="px-5 py-8 text-center text-gray-400">Chưa có dữ liệu sản phẩm</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
