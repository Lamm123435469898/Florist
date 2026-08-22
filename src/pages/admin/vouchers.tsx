import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Save, X, Search, Ticket, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Voucher {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  minimumOrderValue: number;
  maximumDiscount: number | null;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED";
}

interface VoucherFormData {
  code: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: string;
  minimumOrderValue: string;
  maximumDiscount: string;
  startDate: string;
  endDate: string;
  usageLimit: string;
}

const emptyForm: VoucherFormData = {
  code: "",
  discountType: "PERCENTAGE",
  discountValue: "0",
  minimumOrderValue: "0",
  maximumDiscount: "",
  startDate: new Date().toISOString().split("T")[0],
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  usageLimit: "100",
};

function VoucherFormPanel({
  editingVoucher,
  onClose,
  onSaved,
}: {
  editingVoucher: Voucher | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [formData, setFormData] = useState<VoucherFormData>(
    editingVoucher
      ? {
          code: editingVoucher.code,
          discountType: editingVoucher.discountType,
          discountValue: editingVoucher.discountValue.toString(),
          minimumOrderValue: editingVoucher.minimumOrderValue.toString(),
          maximumDiscount: editingVoucher.maximumDiscount?.toString() || "",
          startDate: new Date(editingVoucher.startDate).toISOString().split("T")[0],
          endDate: new Date(editingVoucher.endDate).toISOString().split("T")[0],
          usageLimit: editingVoucher.usageLimit.toString(),
        }
      : emptyForm
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        minimumOrderValue: parseFloat(formData.minimumOrderValue),
        maximumDiscount: formData.maximumDiscount ? parseFloat(formData.maximumDiscount) : null,
        usageLimit: parseInt(formData.usageLimit),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };

      if (editingVoucher) {
        const { data } = await apiClient.put(`/admin/vouchers/${editingVoucher.id}`, payload);
        if (!data.success) throw new Error(data.message);
        toast.success("Đã cập nhật mã giảm giá");
      } else {
        const { data } = await apiClient.post("/admin/vouchers", payload);
        if (!data.success) throw new Error(data.message);
        toast.success("Đã thêm mã giảm giá");
      }
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex lg:static lg:inset-auto lg:z-auto"
    >
      <div className="fixed inset-0 bg-black/40 lg:hidden" onClick={onClose} />

      <div className="relative ml-auto lg:ml-0 w-full max-w-md lg:max-w-none bg-white lg:bg-transparent shadow-2xl lg:shadow-none h-full lg:h-auto overflow-y-auto lg:overflow-visible">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 lg:sticky lg:top-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-gray-900">
              {editingVoucher ? "Chỉnh sửa mã giảm giá" : "Thêm mã giảm giá mới"}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="vcode" className="text-sm font-medium text-gray-700">Mã Voucher (Code) *</Label>
              <Input id="vcode" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} required placeholder="VD: SUMMER2024" className="rounded-lg border-gray-200 uppercase focus-visible:ring-[hsl(154,35%,30%)]/30" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">Loại giảm giá</Label>
                <Select value={formData.discountType} onValueChange={(v: "PERCENTAGE" | "FIXED_AMOUNT") => setFormData({ ...formData, discountType: v })}>
                  <SelectTrigger className="rounded-lg border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Phần trăm (%)</SelectItem>
                    <SelectItem value="FIXED_AMOUNT">Số tiền cố định (₫)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="vvalue" className="text-sm font-medium text-gray-700">Mức giảm *</Label>
                <Input id="vvalue" type="number" min="0" value={formData.discountValue} onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })} required className="rounded-lg border-gray-200 focus-visible:ring-[hsl(154,35%,30%)]/30" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="vmin" className="text-sm font-medium text-gray-700">Đơn hàng tối thiểu (₫)</Label>
                <Input id="vmin" type="number" min="0" value={formData.minimumOrderValue} onChange={(e) => setFormData({ ...formData, minimumOrderValue: e.target.value })} required className="rounded-lg border-gray-200 focus-visible:ring-[hsl(154,35%,30%)]/30" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="vmax" className="text-sm font-medium text-gray-700">Giảm tối đa (₫)</Label>
                <Input id="vmax" type="number" min="0" value={formData.maximumDiscount} onChange={(e) => setFormData({ ...formData, maximumDiscount: e.target.value })} disabled={formData.discountType === 'FIXED_AMOUNT'} placeholder={formData.discountType === 'FIXED_AMOUNT' ? 'Không áp dụng' : 'Không giới hạn'} className="rounded-lg border-gray-200 focus-visible:ring-[hsl(154,35%,30%)]/30 disabled:opacity-50" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="vstart" className="text-sm font-medium text-gray-700">Từ ngày</Label>
                <Input id="vstart" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required className="rounded-lg border-gray-200 focus-visible:ring-[hsl(154,35%,30%)]/30" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="vend" className="text-sm font-medium text-gray-700">Đến ngày</Label>
                <Input id="vend" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} required className="rounded-lg border-gray-200 focus-visible:ring-[hsl(154,35%,30%)]/30" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="vlimit" className="text-sm font-medium text-gray-700">Giới hạn sử dụng (Số lượt)</Label>
              <Input id="vlimit" type="number" min="1" value={formData.usageLimit} onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })} required className="rounded-lg border-gray-200 focus-visible:ring-[hsl(154,35%,30%)]/30" />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving} className="flex-1 bg-[hsl(154,35%,30%)] hover:bg-[hsl(154,35%,25%)] text-white rounded-lg">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {editingVoucher ? "Cập nhật" : "Thêm mới"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="rounded-lg border-gray-200">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}

export default function AdminVouchers() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const { data } = await apiClient.get("/admin/vouchers");
      if (data.success && data.data) {
        setVouchers(data.data);
      }
    } catch {
      toast.error("Không thể tải danh sách voucher");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xác nhận xóa mã giảm giá này?")) return;
    setDeletingId(id);
    try {
      const { data } = await apiClient.delete(`/admin/vouchers/${id}`);
      if (data.success) {
        toast.success("Đã xóa mã giảm giá");
        fetchVouchers();
      }
    } catch {
      toast.error("Không thể xóa mã giảm giá");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredVouchers = vouchers.filter((v) =>
    v.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout title="Quản lý Khuyến mãi">
      <div className="flex flex-col lg:flex-row gap-6 lg:items-start relative">
        <div className={`flex-1 transition-all duration-300 ${(isAdding || editingVoucher) ? 'lg:w-2/3 lg:flex-none' : 'w-full'}`}>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 md:p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4 justify-between bg-white">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm mã Voucher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-gray-50/50 border-gray-200 focus-visible:ring-[hsl(154,35%,30%)]/30 rounded-lg w-full"
                />
              </div>
              <Button
                onClick={() => { setEditingVoucher(null); setIsAdding(true); }}
                className="bg-[hsl(154,35%,30%)] hover:bg-[hsl(154,35%,25%)] text-white shadow-sm rounded-lg whitespace-nowrap"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm Voucher
              </Button>
            </div>

            <div className="overflow-x-auto min-h-[400px]">
              {loading ? (
                <div className="flex justify-center items-center h-48 text-gray-400">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Đang tải...
                </div>
              ) : filteredVouchers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                  <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                    <Ticket className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">Không tìm thấy mã giảm giá</h3>
                  <p className="text-sm text-gray-500">Thử tìm kiếm với từ khóa khác hoặc thêm mã mới.</p>
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 bg-gray-50/80 uppercase font-medium">
                    <tr>
                      <th className="px-5 py-3 whitespace-nowrap">Mã CODE</th>
                      <th className="px-5 py-3 whitespace-nowrap">Mức giảm</th>
                      <th className="px-5 py-3 whitespace-nowrap text-center">Đã dùng / Giới hạn</th>
                      <th className="px-5 py-3 whitespace-nowrap text-center">Trạng thái</th>
                      <th className="px-5 py-3 text-right whitespace-nowrap">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredVouchers.map((v) => {
                      const isExpired = new Date(v.endDate) < new Date();
                      const statusBadge = isExpired ? 'bg-red-50 text-red-700 ring-red-600/20' 
                        : v.status === 'ACTIVE' ? 'bg-green-50 text-green-700 ring-green-600/20' 
                        : 'bg-gray-50 text-gray-600 ring-gray-500/20';
                      
                      return (
                      <tr key={v.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-5 py-3">
                          <span className="font-mono font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
                            {v.code}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="font-medium text-gray-900">
                            {v.discountType === 'PERCENTAGE' ? `${v.discountValue}%` : `${v.discountValue.toLocaleString()}₫`}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Đơn tối thiểu: {v.minimumOrderValue.toLocaleString()}₫
                          </div>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className="text-gray-900 font-medium">{v.usedCount}</span>
                          <span className="text-gray-400"> / {v.usageLimit}</span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ${statusBadge}`}>
                            {isExpired ? 'Hết hạn' : v.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm ngưng'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => { setIsAdding(false); setEditingVoucher(v); }}
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(v.id)}
                              disabled={deletingId === v.id}
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
                            >
                              {deletingId === v.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {(isAdding || editingVoucher) && (
            <div className="lg:w-1/3 lg:shrink-0 h-full">
              <VoucherFormPanel
                editingVoucher={editingVoucher}
                onClose={() => { setIsAdding(false); setEditingVoucher(null); }}
                onSaved={fetchVouchers}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
