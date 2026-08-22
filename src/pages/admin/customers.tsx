import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Search, Loader2, User, Phone, Mail, Clock, ShoppingCart, Ban, CheckCircle2, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Customer {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  isActive: boolean;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  roles: string[];
}

interface CustomerOrder {
  id: string;
  status: number; // OrderStatus enum
  finalTotal: number;
  createdAt: string;
  itemCount: number;
  paymentMethod: string | null;
  paymentStatus: number | null;
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'active', 'blocked'
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCustomers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, statusFilter]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      let url = `/admin/customers?`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
      if (statusFilter === 'active') url += `isActive=true&`;
      if (statusFilter === 'blocked') url += `isActive=false&`;
      
      const { data } = await apiClient.get(url);
      if (data.success) {
        setCustomers(data.data);
      }
    } catch {
      toast.error("Không thể tải danh sách khách hàng");
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerOrders = async (id: string) => {
    setLoadingOrders(true);
    try {
      const { data } = await apiClient.get(`/admin/customers/${id}/orders`);
      if (data.success) {
        setCustomerOrders(data.data);
      }
    } catch {
      toast.error("Không thể tải lịch sử đơn hàng");
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleUpdateStatus = async (id: string, currentStatus: boolean, roles: string[]) => {
    if (roles.includes("ADMIN")) {
      toast.error("Không thể khóa tài khoản Admin");
      return;
    }
    
    const newStatus = !currentStatus;
    const action = newStatus ? 'Mở khóa' : 'Khóa';
    
    if (!confirm(`Bạn có chắc muốn ${action.toLowerCase()} tài khoản này?`)) return;

    try {
      const { data } = await apiClient.put(`/admin/customers/${id}/status`, {
        isActive: newStatus
      });
      if (data.success) {
        toast.success(`Đã ${action.toLowerCase()} tài khoản thành công`);
        fetchCustomers();
        if (selectedCustomer?.id === id) {
          setSelectedCustomer({ ...selectedCustomer, isActive: newStatus });
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi cập nhật trạng thái");
    }
  };

  const openCustomerDetail = (customer: Customer) => {
    setSelectedCustomer(customer);
    fetchCustomerOrders(customer.id);
  };

  return (
    <AdminLayout title="Quản lý Khách hàng">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm tên, email, SĐT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white border-gray-200"
              />
            </div>
            <div className="w-full sm:w-48 flex-shrink-0">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full bg-white border-gray-200">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả tài khoản</SelectItem>
                  <SelectItem value="active">Đang hoạt động</SelectItem>
                  <SelectItem value="blocked">Đã khóa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-[hsl(154,35%,30%)] mx-auto mb-3" />
                <p className="text-sm text-gray-400">Đang tải khách hàng...</p>
              </div>
            ) : customers.length === 0 ? (
              <div className="p-16 text-center">
                <User className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                <p className="text-sm text-gray-400">Không tìm thấy khách hàng nào</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 bg-gray-50 uppercase font-medium border-b border-gray-100">
                    <tr>
                      <th className="px-5 py-3">Khách hàng</th>
                      <th className="px-5 py-3 text-center">Đơn hàng</th>
                      <th className="px-5 py-3 text-right">Tổng chi tiêu</th>
                      <th className="px-5 py-3 text-center">Trạng thái</th>
                      <th className="px-5 py-3 text-right">Tham gia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {customers.map((c) => (
                      <tr key={c.id} onClick={() => openCustomerDetail(c)} className={`hover:bg-gray-50/80 cursor-pointer transition-colors ${selectedCustomer?.id === c.id ? 'bg-[hsl(154,35%,30%)]/5' : ''}`}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-[hsl(154,35%,30%)] flex items-center justify-center text-white font-bold flex-shrink-0">
                              {c.fullName?.charAt(0).toUpperCase() || c.email?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 flex items-center gap-2">
                                {c.fullName || 'Khách vãng lai'}
                                {c.roles.includes('ADMIN') && <Shield className="h-3 w-3 text-blue-500" />}
                              </div>
                              <div className="text-xs text-gray-500">{c.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-center font-medium text-gray-900">{c.totalOrders}</td>
                        <td className="px-5 py-3 text-right font-medium text-gray-900">{c.totalSpent.toLocaleString('vi-VN')} ₫</td>
                        <td className="px-5 py-3 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ${c.isActive ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-red-50 text-red-700 ring-red-600/20'}`}>
                            {c.isActive ? 'Hoạt động' : 'Đã khóa'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right text-gray-500 text-xs">
                          {new Date(c.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Customer Details Panel */}
        <AnimatePresence>
          {selectedCustomer && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-50 flex lg:static lg:inset-auto lg:z-auto w-full lg:w-[450px] flex-shrink-0"
            >
              <div className="fixed inset-0 bg-black/40 lg:hidden" onClick={() => setSelectedCustomer(null)} />
              
              <div className="relative ml-auto lg:ml-0 w-full max-w-md lg:max-w-none bg-white lg:bg-transparent shadow-2xl lg:shadow-none h-full lg:h-auto overflow-y-auto lg:overflow-visible">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full lg:h-[calc(100vh-8rem)] lg:sticky lg:top-6">
                  
                  <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-semibold text-gray-900 text-lg">Hồ sơ khách hàng</h2>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedCustomer(null)} className="h-8 w-8 p-0 rounded-full">
                        ✕
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-[hsl(154,35%,30%)] flex items-center justify-center text-white text-xl font-bold">
                        {selectedCustomer.fullName?.charAt(0).toUpperCase() || selectedCustomer.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-xl text-gray-900 truncate flex items-center gap-2">
                          {selectedCustomer.fullName || 'Chưa cập nhật'}
                          {selectedCustomer.roles.includes('ADMIN') && <Shield className="h-4 w-4 text-blue-500" />}
                        </h3>
                        <p className="text-sm text-gray-500 truncate flex items-center gap-1.5 mt-1">
                          <Mail className="h-3.5 w-3.5" /> {selectedCustomer.email}
                        </p>
                        <p className="text-sm text-gray-500 truncate flex items-center gap-1.5 mt-0.5">
                          <Phone className="h-3.5 w-3.5" /> {selectedCustomer.phoneNumber || 'Không có SĐT'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 flex-1 overflow-y-auto space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1.5"><ShoppingCart className="h-3.5 w-3.5" /> Đơn hàng</div>
                        <div className="text-lg font-bold text-gray-900">{selectedCustomer.totalOrders}</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1.5">Tổng chi tiêu</div>
                        <div className="text-lg font-bold text-[hsl(154,35%,30%)]">{selectedCustomer.totalSpent.toLocaleString('vi-VN')} ₫</div>
                      </div>
                    </div>

                    {/* Order History */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center justify-between">
                        Lịch sử mua hàng
                        <span className="text-xs font-normal text-gray-500">{customerOrders.length} đơn</span>
                      </h4>
                      
                      {loadingOrders ? (
                        <div className="py-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>
                      ) : customerOrders.length === 0 ? (
                        <div className="text-center py-8 text-sm text-gray-500 bg-gray-50 rounded-lg border border-gray-100 border-dashed">
                          Chưa có đơn hàng nào.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {customerOrders.map(order => (
                            <div key={order.id} className="p-3 rounded-lg border border-gray-100 hover:border-[hsl(154,35%,30%)]/30 transition-colors">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <div className="text-xs font-mono text-gray-500 mb-0.5">#{order.id.split('-')[0].toUpperCase()}</div>
                                  <div className="font-medium text-gray-900">{order.finalTotal.toLocaleString('vi-VN')} ₫</div>
                                </div>
                                <div className="text-xs text-gray-400 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                </div>
                              </div>
                              <div className="text-xs text-gray-500 flex justify-between">
                                <span>{order.itemCount} sản phẩm</span>
                                <span>{order.paymentMethod || 'COD'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
                    <Button 
                      variant={selectedCustomer.isActive ? "destructive" : "default"} 
                      className={`w-full ${!selectedCustomer.isActive ? 'bg-green-600 hover:bg-green-700' : ''}`}
                      disabled={selectedCustomer.roles.includes('ADMIN')}
                      onClick={() => handleUpdateStatus(selectedCustomer.id, selectedCustomer.isActive, selectedCustomer.roles)}
                    >
                      {selectedCustomer.isActive ? (
                        <><Ban className="h-4 w-4 mr-2" /> Khóa tài khoản</>
                      ) : (
                        <><CheckCircle2 className="h-4 w-4 mr-2" /> Mở khóa tài khoản</>
                      )}
                    </Button>
                    {selectedCustomer.roles.includes('ADMIN') && (
                      <p className="text-xs text-center text-red-500 mt-2">Không thể khóa tài khoản Admin</p>
                    )}
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
