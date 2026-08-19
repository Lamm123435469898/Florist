import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowLeft, Heart, Package, Shield, Truck } from "lucide-react";
import { AnimatedNavbar } from "@/components/animated-navbar";
import { AnimatedFooter } from "@/components/animated-footer";
import VerticalFlowerLine from "@/components/vertical-flower-line";
import { motion } from "framer-motion";
import { useCart } from "@/contexts/cart-context";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  stock: number | null;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (error) {
      console.error("Error fetching product:", error);
    } else {
      setProduct(data);
    }
    setLoading(false);
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
            <motion.div 
              className="relative aspect-[4/5] bg-secondary/30 rounded-sm overflow-hidden"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <img
                src={product.image_url || "https://via.placeholder.com/600x800?text=No+Image"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </motion.div>

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
                  <span className="text-xs text-foreground/50">
                    {product.stock ? `(Còn ${product.stock} sản phẩm)` : ""}
                  </span>
                </div>

                <div className="flex gap-4">
                  <Button
                    size="lg"
                    className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-none h-14 text-base tracking-wide flex items-center justify-center gap-2"
                    onClick={() => addItem(product.id, quantity)}
                  >
                    <ShoppingBag className="h-5 w-5" />
                    Thêm vào giỏ
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-14 h-14 p-0 rounded-none border-primary/20 text-primary hover:bg-primary/5 flex items-center justify-center"
                  >
                    <Heart className="h-5 w-5" />
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
        </div>
      </section>

      <AnimatedFooter />
    </div>
  );
};

export default ProductDetail;
