import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth-context";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchCartItems();
    } else {
      setItems([]);
      setLoading(false);
    }
  }, [user]);

  const fetchCartItems = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("cart_items")
        .select(`
          *,
          products:product_id (
            id,
            name,
            price,
            image_url,
            stock
          )
        `)
        .eq("user_id", user.id);

      if (error) throw error;
      
      // Filter out items with missing products
      const validItems = (data || []).filter(item => item.products);
      setItems(validItems);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (productId: string, quantity = 1) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to add items to cart",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if item already exists
      const existingItem = items.find(item => item.product_id === productId);
      
      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity;
        await updateQuantity(existingItem.id, newQuantity);
      } else {
        // Add new item
        const { error } = await supabase
          .from("cart_items")
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity,
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Item added to cart",
        });

        fetchCartItems();
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Item removed from cart",
      });

      fetchCartItems();
    } catch (error) {
      console.error("Error removing item from cart:", error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(itemId);
      return;
    }

    try {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("id", itemId);

      if (error) throw error;

      fetchCartItems();
    } catch (error) {
      console.error("Error updating cart quantity:", error);
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;

      setItems([]);
      toast({
        title: "Success",
        description: "Cart cleared",
      });
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive",
      });
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
