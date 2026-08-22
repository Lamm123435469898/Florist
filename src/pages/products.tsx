import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { AnimatedProductCard } from "@/components/ui/animated-card";
import { AnimatedNavbar } from "@/components/animated-navbar";
import { AnimatedFooter } from "@/components/animated-footer";
import { Button } from "@/components/ui/button";
import { ProductGridSkeleton } from "@/components/ui/loading-skeleton";
import VerticalFlowerLine from "@/components/vertical-flower-line";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  variant_id?: string;
  category: string | null;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [isFiltering, setIsFiltering] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only fetch once, we will filter locally for now to match previous behavior

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/products?pageSize=100");
      if (data.success && data.data?.items) {
        const mappedProducts = data.data.items.map((item: any) => ({
          id: item.id,
              variant_id: item.variants?.[0]?.id,
          name: item.name,
          description: item.description,
          price: item.variants?.[0]?.price || 0,
          image_url: item.images?.find((img: any) => img.isPrimary)?.imageUrl || item.images?.[0]?.imageUrl || null,
          category: item.categoryName
        }));
        setProducts(mappedProducts);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await apiClient.get("/categories");
      if (data.success && data.data) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Filter first
  const categoryFiltered = selectedCategory === "all" 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const searchFiltered = categoryFiltered.filter(product =>
    (product.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Then sort
  const sortedProducts = [...searchFiltered].sort((a, b) => {
    if (sortBy === "price-low") return (a.price || 0) - (b.price || 0);
    if (sortBy === "price-high") return (b.price || 0) - (a.price || 0);
    if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
    return 0;
  });

  const filteredProducts = sortedProducts;

  useEffect(() => {
    setIsFiltering(true);
    const timer = setTimeout(() => setIsFiltering(false), 300);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery, sortBy]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <VerticalFlowerLine />
      <AnimatedNavbar />

      {/* Header Section */}
      <section className="relative pt-32 pb-16 bg-secondary/10">
        <div className="container mx-auto px-4 lg:px-[10%] relative z-10 text-center">
          <motion.h1 
            className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Bộ sưu tập
          </motion.h1>
          <motion.p 
            className="text-foreground/70 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Khám phá những tác phẩm nghệ thuật hoa khô được chế tác thủ công tỉ mỉ, mang đến vẻ đẹp tinh tế và bền vững cho không gian của bạn.
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 flex-1">
        <div className="container mx-auto px-4 lg:px-[10%]">
          
          {/* Filters & Search */}
          <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center mb-10 pb-6 border-b border-border">
            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 text-sm transition-colors rounded-sm ${
                  selectedCategory === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-transparent text-foreground/70 hover:bg-secondary"
                }`}
              >
                Tất cả
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`px-4 py-2 text-sm transition-colors rounded-sm ${
                    selectedCategory === category.name
                      ? "bg-primary text-primary-foreground"
                      : "bg-transparent text-foreground/70 hover:bg-secondary"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/50" strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-secondary/30 border border-transparent focus:border-primary/30 focus:bg-white outline-none transition-all text-sm rounded-sm"
                />
                {isFiltering && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-spin" />
                )}
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="pl-4 pr-8 py-2 bg-secondary/30 border border-transparent focus:border-primary/30 outline-none transition-all text-sm appearance-none cursor-pointer rounded-sm"
                >
                  <option value="default">Sắp xếp</option>
                  <option value="price-low">Giá: Thấp đến Cao</option>
                  <option value="price-high">Giá: Cao đến Thấp</option>
                  <option value="name">Tên: A - Z</option>
                </select>
                <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/50 pointer-events-none" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* Results Info */}
          <div className="mb-8 text-sm text-foreground/60">
            Hiển thị {filteredProducts.length} sản phẩm
          </div>

          {/* Product Grid */}
          {loading ? (
            <ProductGridSkeleton />
          ) : filteredProducts.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.div 
                key={selectedCategory + searchQuery + sortBy}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {filteredProducts.map((product) => (
                  <AnimatedProductCard
                    key={product.id}
                    id={product.id}
                    variantId={product.variant_id}
                    name={product.name}
                    price={product.price}
                    imageUrl={product.image_url}
                    category={product.category}
                    stock={product.stock}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="text-center py-24">
              <div className="h-16 w-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-6 w-6 text-foreground/40" />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-2">Không tìm thấy sản phẩm</h3>
              <p className="text-foreground/60 mb-6">Không có sản phẩm nào khớp với tìm kiếm của bạn.</p>
              <Button
                onClick={() => setSearchQuery("")}
                variant="outline"
                className="rounded-none border-primary text-primary hover:bg-primary/5"
              >
                Xóa tìm kiếm
              </Button>
            </div>
          )}
        </div>
      </section>

      <AnimatedFooter />
    </div>
  );
};

export default Products;
