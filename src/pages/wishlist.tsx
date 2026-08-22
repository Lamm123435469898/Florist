import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { toast } from "sonner";
import { Heart, Loader2, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WishlistItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  imageUrl: string | null;
  minPrice: number | null;
}

export default function Wishlist() {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get("/wishlist");
      if (data.success) {
        setItems(data.data || []);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách yêu thích");
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      const { data } = await apiClient.post("/wishlist/toggle", { productId });
      if (data.success) {
        setItems((prev) => prev.filter((item) => item.productId !== productId));
        toast.success("Đã xóa khỏi danh sách yêu thích");
      }
    } catch {
      toast.error("Có lỗi xảy ra khi xóa");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <Heart className="w-16 h-16 text-slate-300 mb-6" />
          <h2 className="text-2xl font-serif text-slate-800 mb-4">Danh sách yêu thích</h2>
          <p className="text-slate-500 mb-8 text-center">Vui lòng đăng nhập để xem danh sách yêu thích của bạn.</p>
          <Link to="/login">
            <Button className="bg-primary text-white">Đăng nhập ngay</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar />
      <main className="flex-1 py-12 px-4 md:px-8 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-8 h-8 text-rose-500" />
          <h1 className="text-3xl font-serif text-slate-800">Sản phẩm yêu thích</h1>
        </div>
        
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Heart className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-medium text-slate-800 mb-2">Chưa có sản phẩm nào</h3>
            <p className="text-slate-500 mb-8 max-w-md">
              Bạn chưa lưu sản phẩm nào vào danh sách yêu thích. Hãy khám phá và lưu lại những mẫu hoa bạn thích nhé!
            </p>
            <Link to="/products">
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 h-12">
                Khám phá ngay
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 group">
                <Link to={`/products/${item.productId}`} className="block relative aspect-[4/5] overflow-hidden">
                  <img
                    src={item.imageUrl || "https://via.placeholder.com/400x500?text=No+Image"}
                    alt={item.productName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </Link>
                <div className="p-5">
                  <Link to={`/products/${item.productId}`}>
                    <h3 className="font-serif text-lg text-slate-800 font-medium truncate hover:text-primary transition-colors">
                      {item.productName}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-between mt-4">
                    <span className="font-medium text-primary">
                      {item.minPrice ? `${item.minPrice.toLocaleString('vi-VN')} ₫` : 'Liên hệ'}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="w-9 h-9 rounded-full border-slate-200 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200"
                        onClick={() => removeFromWishlist(item.productId)}
                        title="Xóa khỏi danh sách"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Link to={`/products/${item.productId}`}>
                        <Button
                          size="icon"
                          className="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 text-white"
                          title="Xem chi tiết"
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
