import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Save, X, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ImageUpload } from "@/components/ui/image-upload";

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
  created_at: string | null;
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

function AdminProductsContent() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: "",
    image_url: "",
    category_id: "",
    stock: "0",
    is_featured: false,
  });

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await apiClient.get("/categories");
      if (data.success && data.data) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await apiClient.get("/products?page=1&pageSize=100");
      if (data.success && data.data?.items) {
        const mapped = data.data.items.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.variants?.[0]?.price || 0,
          image_url: item.images?.find((img: any) => img.isPrimary)?.imageUrl || item.images?.[0]?.imageUrl || null,
          category: item.categoryName,
          category_id: item.categoryId,
          stock: item.variants?.[0]?.stock || 0,
          is_featured: false, // Backend doesn't support this yet
          created_at: new Date().toISOString()
        }));
        setProducts(mapped);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Lỗi",
        description: "Không thể lấy danh sách sản phẩm",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category_id) {
      toast({ title: "Lỗi", description: "Vui lòng chọn danh mục", variant: "destructive" });
      return;
    }

    try {
      if (editingProduct) {
        // Update basic info
        const updateRequest = {
          name: formData.name,
          description: formData.description || null,
          categoryId: formData.category_id,
          isActive: true
        };
        const { data } = await apiClient.put(`/products/${editingProduct.id}`, updateRequest);
        if (!data.success) throw new Error(data.message);
        // Note: updating variants/images requires separate endpoints in our current API structure.
        toast({ title: "Thành công", description: "Đã cập nhật sản phẩm" });
      } else {
        // Create new
        const createRequest = {
          name: formData.name,
          slug: formData.name.toLowerCase().replace(/ /g, "-"),
          description: formData.description || null,
          categoryId: formData.category_id,
          variants: [{
            sku: formData.name.substring(0, 3).toUpperCase() + "-" + Date.now(),
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock),
            size: "Standard"
          }],
          imageUrls: formData.image_url ? [formData.image_url] : []
        };
        const { data } = await apiClient.post("/products", createRequest);
        if (!data.success) throw new Error(data.message);
        toast({ title: "Thành công", description: "Đã thêm sản phẩm" });
      }

      resetForm();
      fetchProducts();
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể lưu sản phẩm",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { data } = await apiClient.delete(`/products/${id}`);
      if (data.success) {
        toast({ title: "Thành công", description: "Đã xóa sản phẩm" });
        fetchProducts();
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({ title: "Lỗi", description: "Không thể xóa sản phẩm", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      image_url: "",
      category_id: "",
      stock: "0",
      is_featured: false,
    });
    setEditingProduct(null);
    setIsAddingProduct(false);
  };

  const startEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      image_url: product.image_url || "",
      category_id: product.category_id || (categories.length > 0 ? categories[0].id : ""),
      stock: (product.stock || 0).toString(),
      is_featured: product.is_featured || false,
    });
    setEditingProduct(product);
    setIsAddingProduct(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading products...</div>
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
          <h1 className="text-3xl font-bold">Quản lý sản phẩm</h1>
        </div>
        <Button onClick={() => setIsAddingProduct(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm sản phẩm
        </Button>
      </div>

      {(isAddingProduct || editingProduct) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Tên sản phẩm</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Giá (VNĐ)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    disabled={!!editingProduct} // Disable for now since update doesn't update variants easily
                  />
                </div>
                <div>
                  <Label htmlFor="category_id">Danh mục</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="stock">Tồn kho</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                    disabled={!!editingProduct} // Same, via variant
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label>Ảnh sản phẩm</Label>
                <ImageUpload
                  value={formData.image_url}
                  onChange={(url) => setFormData({ ...formData, image_url: url })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                />
                <Label htmlFor="is_featured">Sản phẩm nổi bật (chưa hỗ trợ)</Label>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingProduct ? "Cập nhật" : "Thêm"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="h-4 w-4 mr-2" />
                  Hủy
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(product)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded mb-4"
                />
              )}
              <p className="text-gray-600 mb-2 line-clamp-2">{product.description}</p>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{product.price.toLocaleString("vi-VN")} ₫</p>
                <p className="text-sm text-gray-500">Danh mục: {product.category}</p>
                <p className="text-sm text-gray-500">Tồn kho: {product.stock}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Chưa có sản phẩm. Hãy thêm sản phẩm đầu tiên!</p>
        </div>
      )}
    </div>
  );
}

export default function AdminProducts() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminProductsContent />
    </ProtectedRoute>
  );
}
