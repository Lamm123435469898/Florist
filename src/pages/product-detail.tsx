import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowLeft, Heart, Package, Shield, Truck, Star } from "lucide-react";
import { AnimatedNavbar } from "@/components/animated-navbar";
import { AnimatedFooter } from "@/components/animated-footer";
import VerticalFlowerLine from "@/components/vertical-flower-line";
import { motion } from "framer-motion";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

interface Product {
  id: string;
  variant_id?: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  stock: number | null;
  images: string[];
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct(id);
      fetchReviews(id);
      if (isAuthenticated) {
        checkWishlist(id);
      }
    }
  }, [id, isAuthenticated]);

  const checkWishlist = async (productId: string) => {
    try {
      const { data } = await apiClient.get(`/wishlist/${productId}/check`);
      if (data.success) {
        setIsInWishlist(data.data);
      }
    } catch (error) {
      console.error("Error checking wishlist:", error);
    }
  };

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để lưu sản phẩm yêu thích");
      return;
    }
    if (!id) return;

    try {
      setTogglingWishlist(true);
      const { data } = await apiClient.post("/wishlist/toggle", { productId: id });
      if (data.success) {
        setIsInWishlist(data.data.isInWishlist);
        toast.success(data.data.message);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật danh sách yêu thích");
    } finally {
      setTogglingWishlist(false);
    }
  };

  const fetchReviews = async (productId: string) => {
    try {
      const { data } = await apiClient.get(`/reviews/product/${productId}?page=1&pageSize=50`);
      if (data.success) {
        setReviews(data.data.items || []);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setSubmittingReview(true);
      const { data } = await apiClient.post("/reviews", {
        productId: id,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      if (data.success) {
        toast.success("Cảm ơn bạn đã đánh giá!");
        setReviewForm({ rating: 5, comment: "" });
        fetchReviews(id);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra khi gửi đánh giá");
    } finally {
      setSubmittingReview(false);
    }
  };

  const fetchProduct = async (productId: string) => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(`/products/${productId}`);
      
      if (data.success && data.data) {
        const item = data.data;
        const mappedProduct: Product = {
          id: item.id,
          variant_id: item.variants?.[0]?.id,
          name: item.name,
          description: item.description,
          price: item.variants?.[0]?.price || 0,
          image_url: item.images?.find((img: any) => img.isPrimary)?.imageUrl || item.images?.[0]?.imageUrl || null,
          category: item.categoryName,
          stock: item.variants?.[0]?.stock || 0,
          images: item.images?.map((img: any) => img.imageUrl) || []
        };
        setProduct(mappedProduct);
        if (mappedProduct.images.length > 0) {
          setActiveImage(mappedProduct.images[0]);
        } else {
          setActiveImage(mappedProduct.image_url);
        }
      } else {
        setProduct(null);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <VerticalFlowerLine />
        <AnimatedNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent"></div>
        </div>
        <AnimatedFooter />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <VerticalFlowerLine />
        <AnimatedNavbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-4">
          <p className="text-xl text-foreground/50 font-serif mb-6">Không tìm thấy sản phẩm</p>
          <Link to="/products">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/5 rounded-none">
              Quay lại cửa hàng
            </Button>
          </Link>
        </div>
        <AnimatedFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <VerticalFlowerLine />
      <AnimatedNavbar />

      {/* Main Product Section */}
      <section className="pt-32 pb-24 px-4 lg:px-[10%] flex-1">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Link to="/products" className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Trở về
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Product Image */}
            <div className="flex flex-col gap-4">
              <motion.div 
                className="relative aspect-[4/5] bg-secondary/30 rounded-sm overflow-hidden"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <img
                  src={activeImage || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>
              {product.images && product.images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`relative w-20 h-24 flex-shrink-0 rounded-sm overflow-hidden border-2 transition-all ${
                        activeImage === img ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <motion.div
              className="flex flex-col justify-center"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="mb-8 border-b border-border pb-8">
                {product.category && (
                  <div className="text-xs font-semibold tracking-widest uppercase text-foreground/50 mb-4">
                    {product.category}
                  </div>
                )}
                <h1 className="text-4xl lg:text-5xl font-serif font-bold text-foreground mb-6 leading-tight">
                  {product.name}
                </h1>
                <div className="text-2xl font-medium text-accent">
                  {product.price.toLocaleString('vi-VN')} ₫
                </div>
              </div>

              <div className="mb-10 text-foreground/70 leading-relaxed text-base">
                {product.description ? (
                  <p>{product.description}</p>
                ) : (
                  <p>Sản phẩm hoa khô được thiết kế thủ công tinh xảo, mang lại vẻ đẹp thanh lịch và bền bỉ theo thời gian.</p>
                )}
              </div>

              {/* Quantity & Actions */}
              <div className="flex flex-col gap-6 mb-12">
                <div className="flex items-center gap-6">
                  <span className="text-sm font-medium text-foreground">Số lượng</span>
                  <div className="flex items-center border border-border rounded-sm">
                    <button
                      className="w-10 h-10 flex items-center justify-center text-foreground/60 hover:text-primary transition-colors"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </button>
                    <span className="w-12 text-center text-sm font-medium text-foreground">
                      {quantity}
                    </span>
                    <button
                      className="w-10 h-10 flex items-center justify-center text-foreground/60 hover:text-primary transition-colors"
                      onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-secondary rounded-sm text-foreground/70">
                    {product.stock === 0 ? "Hết hàng" : `Còn ${product.stock} sản phẩm`}
                  </span>
                </div>

                <div className="flex gap-4">
                  <Button
                    size="lg"
                    variant="outline"
                    className="flex-1 border-primary text-primary hover:bg-primary/5 rounded-none h-14 text-base tracking-wide flex items-center justify-center gap-2 disabled:opacity-50"
                    disabled={isAdding || isBuyingNow || product.stock === 0}
                    onClick={async () => {
                      setIsAdding(true);
                      await addItem(product.variant_id || product.id, quantity);
                      setIsAdding(false);
                    }}
                  >
                    {isAdding ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-r-transparent mr-2" />
                    ) : (
                      <ShoppingBag className="h-5 w-5" />
                    )}
                    {isAdding ? "Đang thêm..." : product.stock === 0 ? "Hết hàng" : "Thêm vào giỏ"}
                  </Button>

                  <Button
                    size="lg"
                    className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-none h-14 text-base tracking-wide flex items-center justify-center gap-2 disabled:opacity-50"
                    disabled={isAdding || isBuyingNow || product.stock === 0}
                    onClick={async () => {
                      setIsBuyingNow(true);
                      await addItem(product.variant_id || product.id, quantity);
                      setIsBuyingNow(false);
                      navigate("/checkout");
                    }}
                  >
                    {isBuyingNow ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-r-transparent mr-2" />
                    ) : null}
                    {isBuyingNow ? "Đang xử lý..." : "Mua ngay"}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className={`w-14 h-14 p-0 rounded-none border-primary/20 hover:bg-primary/5 flex items-center justify-center transition-colors ${
                      isInWishlist ? "text-rose-500 bg-rose-50" : "text-primary"
                    }`}
                    onClick={toggleWishlist}
                    disabled={togglingWishlist}
                  >
                    <Heart className={`h-5 w-5 ${isInWishlist ? "fill-current" : ""}`} />
                  </Button>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-secondary/20 p-6 space-y-4 rounded-sm">
                <div className="flex items-center gap-4 text-sm text-foreground/80">
                  <Truck className="h-5 w-5 text-accent" strokeWidth={1.5} />
                  <span>Giao hàng tiêu chuẩn 2-3 ngày</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-foreground/80">
                  <Package className="h-5 w-5 text-accent" strokeWidth={1.5} />
                  <span>Đóng gói cẩn thận, an toàn</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-foreground/80">
                  <Shield className="h-5 w-5 text-accent" strokeWidth={1.5} />
                  <span>Cam kết chất lượng 100%</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Reviews Section */}
          <div className="mt-24 max-w-4xl mx-auto">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-8 text-center">Đánh giá sản phẩm</h2>
            
            {isAuthenticated ? (
              <form onSubmit={submitReview} className="bg-white p-6 rounded-lg shadow-sm border border-border mb-12">
                <h3 className="text-lg font-medium mb-4">Viết đánh giá của bạn</h3>
                <div className="mb-4 flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className={`transition-colors ${reviewForm.rating >= star ? "text-yellow-400" : "text-slate-200"}`}
                    >
                      <Star className="h-6 w-6 fill-current" />
                    </button>
                  ))}
                </div>
                <textarea
                  required
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..."
                  className="w-full px-4 py-3 border border-border rounded-lg mb-4 h-24 resize-none focus:outline-none focus:border-primary"
                ></textarea>
                <Button type="submit" disabled={submittingReview} className="bg-primary text-white">
                  {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                </Button>
              </form>
            ) : (
              <div className="bg-secondary/30 p-6 rounded-lg text-center mb-12">
                <p className="text-foreground/70 mb-4">Bạn cần đăng nhập để viết đánh giá.</p>
                <Link to="/login">
                  <Button variant="outline" className="border-primary text-primary">Đăng nhập</Button>
                </Link>
              </div>
            )}

            <div className="space-y-6">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="bg-white p-6 rounded-lg shadow-sm border border-border">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-semibold text-foreground">{review.userFullName}</span>
                        <div className="flex gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${review.rating >= star ? "text-yellow-400 fill-current" : "text-slate-200 fill-current"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-foreground/50">
                        {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <p className="text-foreground/70 mt-3">{review.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-foreground/50 py-8">Chưa có đánh giá nào cho sản phẩm này.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <AnimatedFooter />
    </div>
  );
};

export default ProductDetail;
