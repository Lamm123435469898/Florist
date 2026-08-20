import { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

type UserRole = "admin" | "customer";

export interface User {
  id: string;
  email: string;
  fullName: string;
}

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData: { full_name: string; phone?: string }) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          // Verify token and fetch profile
          const { data } = await apiClient.get("/users/profile");
          if (data.success && data.data) {
            setUser({
              id: data.data.id,
              email: data.data.email,
              fullName: data.data.fullName || data.data.full_name
            });
            // Fetch roles (if we had a roles endpoint, for now we can rely on decoding JWT or fetching from /users)
            // But let's fetch from the backend Admin check or assume customer unless we fetch it.
            try {
              // A simple way to check admin is if they can access an admin endpoint or we have a role endpoint.
              // Let's assume customer, and we will update this later or decode the JWT.
              setUserRole("customer"); 
            } catch (e) {
              setUserRole("customer");
            }
          }
        } catch (error) {
          console.error("Auth init error:", error);
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data } = await apiClient.post("/auth/login", { email, password });
      if (data.success) {
        const { userId, email: userEmail, fullName, accessToken, refreshToken } = data.data;
        localStorage.setItem("access_token", accessToken);
        if (refreshToken) {
          localStorage.setItem("refresh_token", refreshToken);
        }
        setUser({
          id: userId,
          email: userEmail,
          fullName
        });
        
        // Check role by decoding token or hitting an endpoint
        // Simplest: check if token payload has role "ADMIN"
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
          setUserRole(role === "ADMIN" ? "admin" : "customer");
        } catch (e) {
          setUserRole("customer");
        }
        return { error: null };
      }
      return { error: new Error(data.message) };
    } catch (error: any) {
      return { error: error.response?.data?.message || error.message };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    userData: { full_name: string; phone?: string }
  ) => {
    try {
      const { data } = await apiClient.post("/auth/register", {
        email,
        password,
        fullName: userData.full_name,
        phoneNumber: userData.phone
      });
      
      if (data.success) {
        return { error: null };
      }
      return { error: new Error(data.message) };
    } catch (error: any) {
      return { error: error.response?.data?.message || error.message };
    }
  };

  const signOut = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        await apiClient.post("/auth/logout", { refreshToken });
      }
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setUser(null);
      setUserRole(null);
    }
  };

  const value = {
    user,
    userRole,
    isLoading,
    signIn,
    signUp,
    signOut,
    isAdmin: userRole === "admin",
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
