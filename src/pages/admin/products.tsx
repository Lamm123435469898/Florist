import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Save, X, Search, Package, Loader2 } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  category_id: string | null;
  stock: number | null;
  is_featured: boolean | null;
}

interface Category {
  id: string;
  name: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  image_url: string;
  category_id: string;
  stock: string;
  is_featured: boolean;
}

const emptyForm: ProductFormData = {
  name: "",
  description: "",
  price: "",
  image_url: "",
  category_id: "",
  stock: "0",
  is_featured: false,
};

function ProductFormPanel({
  editingProduct,
  categories,
  onClose,
  onSaved,
}: {
  editingProduct: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [formData, setFormData] = useState<ProductFormData>(
    editingProduct
      ? {
          name: editingProduct.name,
          description: editingProduct.description || "",
          price: editingProduct.price.toString(),
          image_url: editingProduct.image_url || "",
          category_id: editingProduct.category_id || (categories.length > 0 ? categories[0].id : ""),
          stock: (editingProduct.stock || 0).toString(),
          is_featured: editingProduct.is_featured || false,
        }
      : emptyForm
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category_id) {
      toast.error("Vui lòng chọn danh mục");
      return;
    }
    setSaving(true);
    try {
      if (editingProduct) {
        const { data } = await apiClient.put(`/products/${editingProduct.id}`, {
          name: formData.name,
          description: formData.description || null,
          categoryId: formData.category_id,
          isActive: true,
        });
        if (!data.success) throw new Error(data.message);
        toast.success("Đã cập nhật sản phẩm");
      } else {
        const { data } = await apiClient.post("/products", {
          name: formData.name,
          slug: formData.name.toLowerCase().replace(/ /g, "-").replace(/[^a-z0-9-]/g, ""),
          description: formData.description || null,
          categoryId: formData.category_id,
          variants: [{ sku: formData.name.substring(0, 3).toUpperCase() + "-" + Date.now(), price: parseFloat(formData.price), stock: parseInt(formData.stock), size: "Standard" }],
          imageUrls: formData.image_url ? [formData.image_url] : [],
        });
        if (!data.success) throw new Error(data.message);
        toast.success("Đã thêm sản phẩm");
      }
      onSaved();
      onClose();
      // Error is handled globally
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
      {/* Mobile backdrop */}
      <div className="fixed inset-0 bg-black/40 lg:hidden" onClick={onClose} />

      <div className="relative ml-auto lg:ml-0 w-full max-w-md lg:max-w-none bg-white lg:bg-transparent shadow-2xl lg:shadow-none h-full lg:h-auto overflow-y-auto lg:overflow-visible">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 lg:sticky lg:top-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-gray-900">
              {editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="pname" className="text-sm font-medium text-gray-700">Tên sản phẩm *</Label>
              <Input id="pname" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="rounded-lg border-gray-200 focus-visible:ring-[hsl(154,35%,30%)]/30" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pprice" className="text-sm font-medium text-gray-700">Giá (₫) *</Label>
                <Input id="pprice" type="number" min="0" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required disabled={!!editingProduct} className="rounded-lg border-gray-200 focus-visible:ring-[hsl(154,35%,30%)]/30 disabled:opacity-50" />
                {editingProduct && <p className="text-[10px] text-gray-400">Giá không thể sửa sau khi tạo</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pstock" className="text-sm font-medium text-gray-700">Tồn kho</Label>
                <Input id="pstock" type="number" min="0" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} disabled={!!editingProduct} className="rounded-lg border-gray-200 focus-visible:ring-[hsl(154,35%,30%)]/30 disabled:opacity-50" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Danh mục *</Label>
              <Select value={formData.category_id} onValueChange={(v) => setFormData({ ...formData, category_id: v })}>
                <SelectTrigger className="rounded-lg border-gray-200">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pdesc" className="text-sm font-medium text-gray-700">Mô tả</Label>
              <Textarea id="pdesc" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="rounded-lg border-gray-200 focus-visible:ring-[hsl(154,35%,30%)]/30 resize-none" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Ảnh sản phẩm</Label>
              <ImageUpload value={formData.image_url} onChange={(url) => setFormData({ ...formData, image_url: url })} />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving} className="flex-1 bg-[hsl(154,35%,30%)] hover:bg-[hsl(154,35%,25%)] text-white rounded-lg">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {editingProduct ? "Cập nhật" : "Thêm mới"}
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

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await apiClient.get("/categories");
      if (data.success && data.data) setCategories(data.data);
    } catch { /* silent */ }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await apiClient.get("/products?page=1&pageSize=100");
      if (data.success && data.data?.items) {
        setProducts(data.data.items.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.variants?.[0]?.price || 0,
          image_url: item.images?.find((img: any) => img.isPrimary)?.imageUrl || item.images?.[0]?.imageUrl || null,
          category: item.categoryName,
          category_id: item.categoryId,
          stock: item.variants?.[0]?.stock || 0,
          is_featured: false,
        })));
      }
    } catch {
      toast.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xác nhận xóa sản phẩm này?")) return;
    setDeletingId(id);
    try {
      const { data } = await apiClient.delete(`/products/${id}`);
      if (data.success) {
        toast.success("Đã xóa sản phẩm");
        fetchProducts();
      }
    } catch {
      // Error handled globally
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showPanel = isAdding || editingProduct !== null;

  return (
    <AdminLayout title="Quản lý sản phẩm">
      <div className={`flex gap-6 ${showPanel ? "lg:gap-8" : ""}`}>
        {/* Product list */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo tên, danh mục..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(154,35%,30%)]/20 focus:border-[hsl(154,35%,30%)]/40 transition-all"
              />
            </div>
            <Button
              onClick={() => { setEditingProduct(null); setIsAdding(true); }}
              className="bg-[hsl(154,35%,30%)] hover:bg-[hsl(154,35%,25%)] text-white rounded-lg flex-shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm sản phẩm
            </Button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-[hsl(154,35%,30%)] mx-auto mb-3" />
                <p className="text-sm text-gray-400">Đang tải sản phẩm...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-16 text-center">
                <Package className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                <p className="text-sm text-gray-400">
                  {searchQuery ? "Không tìm thấy sản phẩm" : "Chưa có sản phẩm nào"}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => { setEditingProduct(null); setIsAdding(true); }}
                    className="mt-4 bg-[hsl(154,35%,30%)] text-white rounded-lg"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm sản phẩm đầu tiên
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <div className="w-12">Ảnh</div>
                  <div>Sản phẩm</div>
                  <div className="w-24 text-right">Giá</div>
                  <div className="w-16 text-center">Kho</div>
                  <div className="w-20 text-center">Thao tác</div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-gray-50">
                  {filteredProducts.map((product, idx) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-5 py-4 items-center hover:bg-gray-50/70 transition-colors"
                    >
                      {/* Image */}
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Name + Category */}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                        {product.category && (
                          <p className="text-xs text-gray-400 mt-0.5">{product.category}</p>
                        )}
                      </div>

                      {/* Price */}
                      <div className="w-24 text-right">
                        <p className="text-sm font-semibold text-gray-800">{product.price.toLocaleString("vi-VN")} ₫</p>
                      </div>

                      {/* Stock */}
                      <div className="w-16 text-center">
                        <span
                          className={`inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full text-xs font-medium ${
                            (product.stock || 0) > 10
                              ? "bg-green-50 text-green-700"
                              : (product.stock || 0) > 0
                              ? "bg-amber-50 text-amber-700"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {product.stock ?? 0}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="w-20 flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => { setIsAdding(false); setEditingProduct(product); }}
                          className="h-8 w-8 rounded-lg border border-gray-200 hover:border-[hsl(154,35%,30%)]/40 hover:bg-[hsl(154,35%,98%)] flex items-center justify-center text-gray-500 hover:text-[hsl(154,35%,30%)] transition-all"
                          title="Chỉnh sửa"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deletingId === product.id}
                          className="h-8 w-8 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 flex items-center justify-center text-gray-500 hover:text-red-500 transition-all disabled:opacity-50"
                          title="Xóa"
                        >
                          {deletingId === product.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Footer count */}
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
                  {filteredProducts.length} / {products.length} sản phẩm
                </div>
              </>
            )}
          </div>
        </div>

        {/* Form panel */}
        <AnimatePresence>
          {showPanel && (
            <div className="w-full lg:w-96 flex-shrink-0">
              <ProductFormPanel
                editingProduct={editingProduct}
                categories={categories}
                onClose={() => { setIsAdding(false); setEditingProduct(null); }}
                onSaved={fetchProducts}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
