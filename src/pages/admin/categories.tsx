import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Save, X, Search, Folder, Loader2 } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import { motion, AnimatePresence } from "framer-motion";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
}

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
}

const emptyForm: CategoryFormData = {
  name: "",
  slug: "",
  description: "",
  imageUrl: "",
  isActive: true,
};

function CategoryFormPanel({
  editingCategory,
  onClose,
  onSaved,
}: {
  editingCategory: Category | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [formData, setFormData] = useState<CategoryFormData>(
    editingCategory
      ? {
          name: editingCategory.name,
          slug: editingCategory.slug,
          description: editingCategory.description || "",
          imageUrl: editingCategory.imageUrl || "",
          isActive: editingCategory.isActive,
        }
      : emptyForm
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingCategory) {
        const { data } = await apiClient.put(`/categories/${editingCategory.id}`, {
          name: formData.name,
          description: formData.description || null,
          imageUrl: formData.imageUrl || null,
          isActive: formData.isActive,
        });
        if (!data.success) throw new Error(data.message);
        toast.success("Đã cập nhật danh mục");
      } else {
        const generatedSlug = formData.name.toLowerCase().replace(/ /g, "-").replace(/[^a-z0-9-]/g, "");
        const { data } = await apiClient.post("/categories", {
          name: formData.name,
          slug: formData.slug || generatedSlug,
          description: formData.description || null,
          imageUrl: formData.imageUrl || null,
          isActive: formData.isActive,
        });
        if (!data.success) throw new Error(data.message);
        toast.success("Đã thêm danh mục");
      }
      onSaved();
      onClose();
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
              {editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cname" className="text-sm font-medium text-gray-700">Tên danh mục *</Label>
              <Input id="cname" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="rounded-lg border-gray-200 focus-visible:ring-[hsl(154,35%,30%)]/30" />
            </div>

            {!editingCategory && (
              <div className="space-y-1.5">
                <Label htmlFor="cslug" className="text-sm font-medium text-gray-700">Đường dẫn (Slug)</Label>
                <Input id="cslug" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="tu-dong-tao-tu-ten" className="rounded-lg border-gray-200 focus-visible:ring-[hsl(154,35%,30%)]/30" />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="cdesc" className="text-sm font-medium text-gray-700">Mô tả</Label>
              <Textarea id="cdesc" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="rounded-lg border-gray-200 focus-visible:ring-[hsl(154,35%,30%)]/30 resize-none" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Ảnh danh mục</Label>
              <ImageUpload value={formData.imageUrl} onChange={(url) => setFormData({ ...formData, imageUrl: url })} />
            </div>
            
            {editingCategory && (
              <div className="flex items-center gap-2">
                 <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} className="rounded text-[hsl(154,35%,30%)] focus:ring-[hsl(154,35%,30%)]" />
                 <Label htmlFor="isActive" className="text-sm font-medium text-gray-700">Hoạt động</Label>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving} className="flex-1 bg-[hsl(154,35%,30%)] hover:bg-[hsl(154,35%,25%)] text-white rounded-lg">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {editingCategory ? "Cập nhật" : "Thêm mới"}
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

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await apiClient.get("/categories");
      if (data.success && data.data) {
        setCategories(data.data);
      }
    } catch {
      toast.error("Không thể tải danh mục");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xác nhận xóa danh mục này?")) return;
    setDeletingId(id);
    try {
      const { data } = await apiClient.delete(`/categories/${id}`);
      if (data.success) {
        toast.success("Đã xóa danh mục");
        fetchCategories();
      }
    } finally {
      setDeletingId(null);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout title="Quản lý Danh mục">
      <div className="flex flex-col lg:flex-row gap-6 lg:items-start relative">
        <div className={`flex-1 transition-all duration-300 ${(isAdding || editingCategory) ? 'lg:w-2/3 lg:flex-none' : 'w-full'}`}>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 md:p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4 justify-between bg-white">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm danh mục..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-gray-50/50 border-gray-200 focus-visible:ring-[hsl(154,35%,30%)]/30 rounded-lg w-full"
                />
              </div>
              <Button
                onClick={() => { setEditingCategory(null); setIsAdding(true); }}
                className="bg-[hsl(154,35%,30%)] hover:bg-[hsl(154,35%,25%)] text-white shadow-sm rounded-lg whitespace-nowrap"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm danh mục
              </Button>
            </div>

            <div className="overflow-x-auto min-h-[400px]">
              {loading ? (
                <div className="flex justify-center items-center h-48 text-gray-400">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Đang tải...
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                  <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                    <Folder className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">Không tìm thấy danh mục</h3>
                  <p className="text-sm text-gray-500">Thử tìm kiếm với từ khóa khác hoặc thêm danh mục mới.</p>
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 bg-gray-50/80 uppercase font-medium">
                    <tr>
                      <th className="px-5 py-3 whitespace-nowrap">Danh mục</th>
                      <th className="px-5 py-3 whitespace-nowrap">Đường dẫn</th>
                      <th className="px-5 py-3 whitespace-nowrap text-center">Trạng thái</th>
                      <th className="px-5 py-3 text-right whitespace-nowrap">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredCategories.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                              {c.imageUrl ? (
                                <img src={c.imageUrl} alt={c.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-gray-300">
                                  <Folder className="h-5 w-5" />
                                </div>
                              )}
                            </div>
                            <div className="font-medium text-gray-900">{c.name}</div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-gray-500">{c.slug}</td>
                        <td className="px-5 py-3 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${c.isActive ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20' : 'bg-gray-50 text-gray-600 ring-1 ring-gray-500/20'}`}>
                            {c.isActive ? 'Hoạt động' : 'Đã ẩn'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => { setIsAdding(false); setEditingCategory(c); }}
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(c.id)}
                              disabled={deletingId === c.id}
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
                            >
                              {deletingId === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {(isAdding || editingCategory) && (
            <div className="lg:w-1/3 lg:shrink-0 h-full">
              <CategoryFormPanel
                editingCategory={editingCategory}
                onClose={() => { setIsAdding(false); setEditingCategory(null); }}
                onSaved={fetchCategories}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
