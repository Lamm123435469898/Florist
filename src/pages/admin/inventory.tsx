import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, X, Search, Package, Loader2, ArrowUpRight, ArrowDownRight, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface Product {
  id: string;
  name: string;
  categoryName: string;
  variants: {
    id: string;
    sku: string;
    stock: number;
    price: number;
  }[];
  images: { imageUrl: string; isPrimary: boolean }[];
}

interface InventoryTransaction {
  id: string;
  type: string;
  quantity: number;
  referenceId: string | null;
  note: string | null;
  createdAt: string;
}

export default function AdminInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Adjust stock modal state
  const [adjustVariant, setAdjustVariant] = useState<{ productId: string, variantId: string, sku: string, name: string, currentStock: number } | null>(null);
  const [adjustForm, setAdjustForm] = useState({ type: 'add', quantity: '1', note: '' });
  const [isAdjusting, setIsAdjusting] = useState(false);

  // Transactions modal state
  const [viewTransactionsVariant, setViewTransactionsVariant] = useState<{ variantId: string, sku: string, name: string } | null>(null);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // For inventory, we want all products to see their stock
      const { data } = await apiClient.get("/products?page=1&pageSize=100");
      if (data.success && data.data?.items) {
        setProducts(data.data.items);
      }
    } catch {
      toast.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustVariant) return;
    setIsAdjusting(true);
    
    try {
      let qty = parseInt(adjustForm.quantity);
      if (adjustForm.type === 'remove') qty = -qty;
      
      const { data } = await apiClient.post("/admin/inventory/adjust", {
        variantId: adjustVariant.variantId,
        quantity: qty,
        note: adjustForm.note || (adjustForm.type === 'add' ? 'Thêm số lượng' : 'Giảm số lượng')
      });
      
      if (data.success) {
        toast.success("Đã cập nhật kho");
        setAdjustVariant(null);
        fetchProducts(); // Refresh to get new stock
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Không thể cập nhật kho");
    } finally {
      setIsAdjusting(false);
    }
  };

  const fetchTransactions = async (variantId: string, sku: string, name: string) => {
    setViewTransactionsVariant({ variantId, sku, name });
    setLoadingTransactions(true);
    try {
      const { data } = await apiClient.get(`/admin/inventory/${variantId}/transactions`);
      if (data.success) {
        setTransactions(data.data);
      }
    } catch {
      toast.error("Không thể tải lịch sử giao dịch");
    } finally {
      setLoadingTransactions(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.variants.some(v => v.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AdminLayout title="Quản lý Kho">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 md:p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4 justify-between bg-white">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm tên sản phẩm hoặc SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-gray-50/50 border-gray-200 focus-visible:ring-[hsl(154,35%,30%)]/30 rounded-lg w-full"
            />
          </div>
          <Button variant="outline" onClick={fetchProducts} className="rounded-lg border-gray-200 whitespace-nowrap">
            <RotateCcw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex justify-center items-center h-48 text-gray-400">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Đang tải...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-4">
              <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Không tìm thấy sản phẩm</h3>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 bg-gray-50/80 uppercase font-medium">
                <tr>
                  <th className="px-5 py-3 whitespace-nowrap">Sản phẩm</th>
                  <th className="px-5 py-3 whitespace-nowrap">SKU (Mã)</th>
                  <th className="px-5 py-3 whitespace-nowrap text-center">Số lượng tồn</th>
                  <th className="px-5 py-3 whitespace-nowrap text-center">Trạng thái</th>
                  <th className="px-5 py-3 text-right whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.flatMap(p => 
                  p.variants.map((v, i) => {
                    const primaryImg = p.images?.find((img) => img.isPrimary)?.imageUrl || p.images?.[0]?.imageUrl;
                    const isLowStock = v.stock <= 5;
                    const isOutOfStock = v.stock === 0;

                    return (
                      <tr key={v.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            {i === 0 && (
                              <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                                {primaryImg ? (
                                  <img src={primaryImg} alt={p.name} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-gray-300">
                                    <Package className="h-5 w-5" />
                                  </div>
                                )}
                              </div>
                            )}
                            {i !== 0 && <div className="w-10 shrink-0"></div>}
                            <div>
                              <div className="font-medium text-gray-900">{i === 0 ? p.name : ''}</div>
                              {i === 0 && <div className="text-xs text-gray-500">{p.categoryName}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-gray-500 font-mono text-xs">{v.sku}</td>
                        <td className="px-5 py-3 text-center">
                          <span className={`font-semibold ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-orange-500' : 'text-gray-900'}`}>
                            {v.stock}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ${isOutOfStock ? 'bg-red-50 text-red-700 ring-red-600/20' : isLowStock ? 'bg-orange-50 text-orange-700 ring-orange-600/20' : 'bg-green-50 text-green-700 ring-green-600/20'}`}>
                            {isOutOfStock ? 'Hết hàng' : isLowStock ? 'Sắp hết' : 'Còn hàng'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => fetchTransactions(v.id, v.sku, p.name)}
                              className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md"
                            >
                              Lịch sử
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setAdjustVariant({ productId: p.id, variantId: v.id, sku: v.sku, name: p.name, currentStock: v.stock });
                                setAdjustForm({ type: 'add', quantity: '1', note: '' });
                              }}
                              className="h-8 rounded-md border-gray-200"
                            >
                              Điều chỉnh
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Adjust Modal */}
      <AnimatePresence>
        {adjustVariant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40" onClick={() => setAdjustVariant(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-gray-900">Điều chỉnh kho</h3>
                <button onClick={() => setAdjustVariant(null)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
              </div>
              
              <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="font-medium text-gray-900 mb-1">{adjustVariant.name}</div>
                <div className="text-sm text-gray-500 font-mono">SKU: {adjustVariant.sku} | Tồn hiện tại: <span className="font-bold text-gray-900">{adjustVariant.currentStock}</span></div>
              </div>

              <form onSubmit={handleAdjustStock} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button type="button" variant={adjustForm.type === 'add' ? 'default' : 'outline'} onClick={() => setAdjustForm({...adjustForm, type: 'add'})} className={adjustForm.type === 'add' ? 'bg-green-600 hover:bg-green-700' : ''}>
                    <ArrowUpRight className="h-4 w-4 mr-2" /> Thêm (+)
                  </Button>
                  <Button type="button" variant={adjustForm.type === 'remove' ? 'default' : 'outline'} onClick={() => setAdjustForm({...adjustForm, type: 'remove'})} className={adjustForm.type === 'remove' ? 'bg-red-600 hover:bg-red-700' : ''}>
                    <ArrowDownRight className="h-4 w-4 mr-2" /> Trừ (-)
                  </Button>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="qty">Số lượng</Label>
                  <Input id="qty" type="number" min="1" max={adjustForm.type === 'remove' ? adjustVariant.currentStock : undefined} value={adjustForm.quantity} onChange={(e) => setAdjustForm({...adjustForm, quantity: e.target.value})} required className="rounded-lg border-gray-200" />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="note">Ghi chú (Lý do)</Label>
                  <Textarea id="note" value={adjustForm.note} onChange={(e) => setAdjustForm({...adjustForm, note: e.target.value})} placeholder={adjustForm.type === 'add' ? 'Nhập kho từ nhà cung cấp...' : 'Hàng lỗi, thất thoát...'} className="rounded-lg border-gray-200 resize-none h-20" />
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <Button type="submit" disabled={isAdjusting} className="flex-1 bg-[hsl(154,35%,30%)] hover:bg-[hsl(154,35%,25%)]">
                    {isAdjusting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Xác nhận {adjustForm.type === 'add' ? 'thêm' : 'trừ'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setAdjustVariant(null)}>Hủy</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Transactions Modal */}
      <AnimatePresence>
        {viewTransactionsVariant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40" onClick={() => setViewTransactionsVariant(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Lịch sử xuất/nhập kho</h3>
                  <div className="text-sm text-gray-500">{viewTransactionsVariant.name} - SKU: <span className="font-mono">{viewTransactionsVariant.sku}</span></div>
                </div>
                <button onClick={() => setViewTransactionsVariant(null)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
              </div>
              
              <div className="p-6 overflow-y-auto min-h-[300px]">
                {loadingTransactions ? (
                  <div className="flex justify-center items-center h-full text-gray-400">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" /> Đang tải...
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="flex justify-center items-center h-full text-gray-400">
                    Chưa có lịch sử giao dịch.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map(t => (
                      <div key={t.id} className="flex gap-4 p-4 rounded-lg border border-gray-100 bg-gray-50/50">
                        <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${t.type === 'OUT' ? 'bg-red-100 text-red-600' : t.type === 'RELEASE' || t.type === 'ADJUSTMENT' && t.quantity > 0 ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                          {t.type === 'OUT' || (t.type === 'ADJUSTMENT' && t.quantity < 0) ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-900">
                              {t.type === 'OUT' ? 'Xuất kho (Đơn hàng)' : t.type === 'RELEASE' ? 'Hoàn kho (Hủy đơn)' : 'Điều chỉnh kho'}
                            </span>
                            <span className={`font-semibold ${t.type === 'OUT' ? 'text-red-600' : 'text-green-600'}`}>
                              {t.type === 'OUT' ? '-' : '+'}{t.quantity}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mb-1">{t.note}</div>
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>{t.referenceId && `Mã tham chiếu: ${t.referenceId}`}</span>
                            <span>{format(new Date(t.createdAt), "HH:mm dd/MM/yyyy", { locale: vi })}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
