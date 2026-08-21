import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "./auth-context";
import { toast } from "sonner";

interface CartItem {
  id: string;
  product_id: string | null;
  quantity: number;
  user_id: string | null;
  created_at: string | null;
  products?: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    stock: number | null;
    category?: string | null;
  } | null;
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCartItems();
    } else {
      setItems([]);
      setLoading(false);
    }
  }, [user]);

  const mapCartDtoToItems = (cartDto: any): CartItem[] => {
    if (!cartDto || !cartDto.items) return [];
    return cartDto.items.map((item: any) => ({
      id: item.id,
      product_id: item.productVariantId, // Store variant id as product_id
      quantity: item.quantity,
      user_id: user?.id || null,
      created_at: new Date().toISOString(),
      products: {
        id: item.productVariantId,
        name: item.productName,
        price: item.price,
        image_url: item.imageUrl,
        stock: 100, // Default stock if not provided
        category: item.categoryName
      }
    }));
  };

  const fetchCartItems = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data } = await apiClient.get("/cart");
      if (data.success && data.data) {
        setItems(mapCartDtoToItems(data.data));
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (productId: string, quantity = 1) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ");
      return;
    }

    try {
      const { data } = await apiClient.post("/cart/items", {
        productVariantId: productId,
        quantity
      });

      if (data.success) {
        toast.success("Đã thêm sản phẩm vào giỏ");
        setItems(mapCartDtoToItems(data.data));
      }
    } catch (error) {
      // Global error handler will show the toast
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const { data } = await apiClient.delete(`/cart/items/${itemId}`);
      if (data.success) {
        toast.success("Đã xóa sản phẩm khỏi giỏ");
        setItems(mapCartDtoToItems(data.data));
      }
    } catch (error) {
      // Global error handler will show the toast
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(itemId);
      return;
    }

    try {
      const { data } = await apiClient.put(`/cart/items/${itemId}`, { quantity });
      if (data.success) {
        setItems(mapCartDtoToItems(data.data));
      }
    } catch (error) {
      // Global error handler will show the toast
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      const { data } = await apiClient.delete("/cart");
      if (data.success) {
        setItems([]);
        toast.success("Đã xóa toàn bộ giỏ hàng");
      }
    } catch (error) {
      // Global error handler will show the toast
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => {
    if (!item.products) return sum;
    return sum + (item.quantity * (item.products.price || 0));
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
