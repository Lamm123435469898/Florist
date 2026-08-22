import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Search, Loader2, CreditCard, Clock, FileText, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Payment {
  id: string;
  paymentProvider: string;
  amount: number;
  status: number; // 0=PENDING, 1=COMPLETED, 2=FAILED, 3=REFUNDED, 4=CANCELLED
  transactionId: string | null;
  paymentReference: string | null;
  orderId: string;
  createdAt: string;
  updatedAt: string;
  order: {
    customerName: string;
    customerEmail: string;
    finalTotal: number;
  } | null;
}

interface PaymentTransaction {
  id: string;
  status: number;
  providerResponse: string | null;
  createdAt: string;
}

interface PaymentDetail extends Payment {
  transactions: PaymentTransaction[];
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  
  const [selectedPayment, setSelectedPayment] = useState<PaymentDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPayments();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, statusFilter, methodFilter]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      let url = `/admin/payments?`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
      if (statusFilter !== 'all') url += `status=${statusFilter}&`;
      if (methodFilter !== 'all') url += `method=${methodFilter}&`;
      
      const { data } = await apiClient.get(url);
      if (data.success) {
        setPayments(data.data);
      }
    } catch {
      toast.error("Không thể tải danh sách thanh toán");
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentDetail = async (id: string) => {
    setLoadingDetail(true);
    try {
      const { data } = await apiClient.get(`/admin/payments/${id}`);
      if (data.success) {
        setSelectedPayment(data.data);
      }
    } catch {
      toast.error("Không thể tải chi tiết thanh toán");
    } finally {
      setLoadingDetail(false);
    }
  };

  const getStatusBadge = (status: number) => {
    switch(status) {
      case 0: return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 bg-orange-50 text-orange-700 ring-orange-600/20">Chờ thanh toán</span>;
      case 1: return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 bg-green-50 text-green-700 ring-green-600/20">Thành công</span>;
      case 2: return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 bg-red-50 text-red-700 ring-red-600/20">Thất bại</span>;
      case 3: return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 bg-blue-50 text-blue-700 ring-blue-600/20">Đã hoàn tiền</span>;
      default: return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 bg-gray-50 text-gray-700 ring-gray-600/20">Đã hủy</span>;
    }
  };

  return (
    <AdminLayout title="Quản lý Thanh toán">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm mã thanh toán, mã đơn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white border-gray-200"
              />
            </div>
            <div className="w-full sm:w-40 flex-shrink-0">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full bg-white border-gray-200">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="0">Chờ thanh toán</SelectItem>
                  <SelectItem value="1">Thành công</SelectItem>
                  <SelectItem value="2">Thất bại</SelectItem>
                  <SelectItem value="3">Đã hoàn tiền</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-40 flex-shrink-0">
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-full bg-white border-gray-200">
                  <SelectValue placeholder="Phương thức" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Mọi phương thức</SelectItem>
                  <SelectItem value="SePay">Chuyển khoản (SePay)</SelectItem>
                  <SelectItem value="COD">Thanh toán khi nhận hàng</SelectItem>
                  <SelectItem value="MOMO">MoMo</SelectItem>
                  <SelectItem value="VNPAY">VNPay</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-[hsl(154,35%,30%)] mx-auto mb-3" />
                <p className="text-sm text-gray-400">Đang tải giao dịch...</p>
              </div>
            ) : payments.length === 0 ? (
              <div className="p-16 text-center">
                <CreditCard className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                <p className="text-sm text-gray-400">Không tìm thấy giao dịch nào</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 bg-gray-50 uppercase font-medium border-b border-gray-100">
                    <tr>
                      <th className="px-5 py-3">Mã GD / Đơn hàng</th>
                      <th className="px-5 py-3">Khách hàng</th>
                      <th className="px-5 py-3 text-right">Số tiền</th>
                      <th className="px-5 py-3 text-center">Phương thức</th>
                      <th className="px-5 py-3 text-center">Trạng thái</th>
                      <th className="px-5 py-3 text-right">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {payments.map((p) => (
                      <tr key={p.id} onClick={() => fetchPaymentDetail(p.id)} className={`hover:bg-gray-50/80 cursor-pointer transition-colors ${selectedPayment?.id === p.id ? 'bg-[hsl(154,35%,30%)]/5' : ''}`}>
                        <td className="px-5 py-3">
                          <div className="font-mono font-medium text-[hsl(154,35%,30%)]">{p.paymentReference || 'N/A'}</div>
                          <div className="text-xs text-gray-500 font-mono">Đơn: #{p.orderId.split('-')[0].toUpperCase()}</div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="font-medium text-gray-900">{p.order?.customerName || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{p.order?.customerEmail}</div>
                        </td>
                        <td className="px-5 py-3 text-right font-medium text-gray-900">{p.amount.toLocaleString('vi-VN')} ₫</td>
                        <td className="px-5 py-3 text-center">
                          <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-600">{p.paymentProvider}</span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          {getStatusBadge(p.status)}
                        </td>
                        <td className="px-5 py-3 text-right text-gray-500 text-xs">
                          {new Date(p.createdAt).toLocaleString('vi-VN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Payment Details Panel */}
        <AnimatePresence>
          {selectedPayment && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-50 flex lg:static lg:inset-auto lg:z-auto w-full lg:w-[450px] flex-shrink-0"
            >
              <div className="fixed inset-0 bg-black/40 lg:hidden" onClick={() => setSelectedPayment(null)} />
              
              <div className="relative ml-auto lg:ml-0 w-full max-w-md lg:max-w-none bg-white lg:bg-transparent shadow-2xl lg:shadow-none h-full lg:h-auto overflow-y-auto lg:overflow-visible">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full lg:h-[calc(100vh-8rem)] lg:sticky lg:top-6">
                  
                  {loadingDetail ? (
                    <div className="flex-1 flex justify-center items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-[hsl(154,35%,30%)]" />
                    </div>
                  ) : (
                    <>
                      <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="font-semibold text-gray-900 text-lg">Chi tiết thanh toán</h2>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedPayment(null)} className="h-8 w-8 p-0 rounded-full">
                            ✕
                          </Button>
                        </div>
                        
                        <div className="flex flex-col items-center justify-center text-center p-4">
                          <div className={`h-16 w-16 rounded-full flex items-center justify-center mb-3 ${
                            selectedPayment.status === 1 ? 'bg-green-100 text-green-600' :
                            selectedPayment.status === 2 ? 'bg-red-100 text-red-600' :
                            selectedPayment.status === 3 ? 'bg-blue-100 text-blue-600' :
                            'bg-orange-100 text-orange-600'
                          }`}>
                            {selectedPayment.status === 1 ? <CheckCircle2 className="h-8 w-8" /> :
                             selectedPayment.status === 2 ? <XCircle className="h-8 w-8" /> :
                             <Clock className="h-8 w-8" />}
                          </div>
                          <div className="text-3xl font-bold text-gray-900">{selectedPayment.amount.toLocaleString('vi-VN')} ₫</div>
                          <div className="mt-2">{getStatusBadge(selectedPayment.status)}</div>
                        </div>
                      </div>

                      <div className="p-6 flex-1 overflow-y-auto space-y-6">
                        {/* Transaction Info */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <FileText className="h-4 w-4" /> Thông tin giao dịch
                          </h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Mã tham chiếu (Ref)</span>
                              <span className="font-mono font-medium text-gray-900">{selectedPayment.paymentReference || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Mã GD đối tác</span>
                              <span className="font-mono font-medium text-gray-900">{selectedPayment.transactionId || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Phương thức</span>
                              <span className="font-medium text-gray-900">{selectedPayment.paymentProvider}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Mã đơn hàng</span>
                              <span className="font-mono text-[hsl(154,35%,30%)]">#{selectedPayment.orderId.split('-')[0].toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Ngày tạo</span>
                              <span className="text-gray-900">{new Date(selectedPayment.createdAt).toLocaleString('vi-VN')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Cập nhật cuối</span>
                              <span className="text-gray-900">{new Date(selectedPayment.updatedAt).toLocaleString('vi-VN')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Order Summary */}
                        {selectedPayment.order && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Thông tin đơn hàng</h4>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm border border-gray-100">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Khách hàng</span>
                                <span className="font-medium text-gray-900">{selectedPayment.order.customerName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Email</span>
                                <span className="text-gray-900">{selectedPayment.order.customerEmail}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Giá trị đơn</span>
                                <span className="font-medium text-gray-900">{selectedPayment.order.finalTotal.toLocaleString('vi-VN')} ₫</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Transaction Logs */}
                        {selectedPayment.transactions && selectedPayment.transactions.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Lịch sử thay đổi (Webhooks)</h4>
                            <div className="space-y-3">
                              {selectedPayment.transactions.map((tx) => (
                                <div key={tx.id} className="p-3 rounded-lg border border-gray-100 text-sm">
                                  <div className="flex justify-between items-center mb-2">
                                    {getStatusBadge(tx.status)}
                                    <span className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleString('vi-VN')}</span>
                                  </div>
                                  {tx.providerResponse && (
                                    <div className="mt-1">
                                      <span className="text-gray-500">Phản hồi từ ĐT:</span>
                                      <span className="font-mono text-gray-900 text-xs break-all block">{tx.providerResponse}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-4 border-t border-gray-100 bg-blue-50 flex items-start gap-3 flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-700 leading-relaxed">
                          Trạng thái thanh toán được cập nhật tự động qua Webhook từ đối tác ({selectedPayment.paymentProvider}). Admin không thể thay đổi thủ công để đảm bảo tính minh bạch.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
