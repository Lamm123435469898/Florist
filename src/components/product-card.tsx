import { Link } from "react-router-dom";
import { ShoppingBag, Eye } from "lucide-react";
import { useCart } from "@/contexts/cart-context";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  category?: string | null;
  variantId?: string;
}

const ProductCard = ({ id, name, price, imageUrl, category, variantId }: ProductCardProps) => {
  const { addItem } = useCart();
  const fallbackImage = "/placeholder.svg";

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addItem(variantId || id);
  };

  return (
    <div className="group flex flex-col">
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary/30 mb-4 rounded-sm">
        <img 
          src={imageUrl || fallbackImage} 
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Animated Overlay */}
        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Action Buttons */}
        <div className="absolute inset-x-0 bottom-0 p-4 flex justify-center gap-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <Link to={`/products/${id}`} className="flex-1">
            <button
              className="w-full bg-white text-primary hover:bg-primary hover:text-white transition-colors py-2.5 rounded-sm flex items-center justify-center gap-2 text-sm font-medium shadow-sm"
              aria-label="Xem chi tiê't"
            >
              <Eye className="h-4 w-4" />
              Chi tiết
            </button>
          </Link>
          <button
            className="flex-1 bg-primary text-white hover:bg-primary/90 transition-colors py-2.5 rounded-sm flex items-center justify-center gap-2 text-sm font-medium shadow-sm"
            aria-label="Thêm vào giỏ"
            onClick={handleAddToCart}
          >
            <ShoppingBag className="h-4 w-4" />
            Mua ngay
          </button>
        </div>

        {/* Category Badge */}
        {category && (
          <div className="absolute top-4 left-4">
            <span className="bg-white/90 backdrop-blur-sm text-primary text-[10px] font-medium px-3 py-1 rounded-sm uppercase tracking-wider">
              {category}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-col items-center text-center space-y-1.5 px-2">
        <Link to={`/products/${id}`}>
          <h3 className="font-serif text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {name}
          </h3>
        </Link>
        <p className="text-accent font-semibold tracking-wide">
          {price.toLocaleString('vi-VN')} ₫
        </p>
      </div>
    </div>
  );
};

export default ProductCard;
