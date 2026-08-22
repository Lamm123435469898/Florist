import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Folder,
  Archive,
  Ticket,
  Users,
  DollarSign,
  ShieldAlert
} from "lucide-react";
import { useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/categories", label: "Danh mục", icon: Folder },
  { to: "/admin/products", label: "Sản phẩm", icon: Package },
  { to: "/admin/inventory", label: "Kho hàng", icon: Archive },
  { to: "/admin/orders", label: "Đơn hàng", icon: ShoppingCart },
  { to: "/admin/customers", label: "Khách hàng", icon: Users },
  { to: "/admin/payments", label: "Thanh toán", icon: DollarSign },
  { to: "/admin/vouchers", label: "Khuyến mãi", icon: Ticket },
  { to: "/admin/audit-logs", label: "Audit Logs", icon: ShieldAlert },
];

function AdminLayoutContent({ children, title }: AdminLayoutProps) {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "Đã đăng xuất" });
    navigate("/");
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside
      className={`flex flex-col bg-[hsl(154,40%,12%)] text-white ${
        mobile ? "fixed inset-0 z-50 w-72" : "hidden lg:flex w-64 min-h-screen fixed top-0 left-0 bottom-0"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <div>
          <span className="font-serif text-xl font-bold tracking-tight text-white">
            Florist<span className="text-[hsl(350,45%,70%)]">.</span>
          </span>
          <p className="text-[10px] uppercase tracking-widest text-white/40 mt-0.5">
            Admin Panel
          </p>
        </div>
        {mobile && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => mobile && setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/8"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`h-4 w-4 flex-shrink-0 transition-colors ${
                    isActive ? "text-[hsl(350,45%,70%)]" : "text-white/50 group-hover:text-white/80"
                  }`}
                />
                {item.label}
                {isActive && (
                  <ChevronRight className="h-3 w-3 ml-auto text-white/40" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 pb-6 pt-3 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="h-8 w-8 rounded-full bg-[hsl(350,45%,70%)] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.email?.charAt(0).toUpperCase() ?? "A"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.email}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-wider">Admin</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-white/60 hover:text-red-400 hover:bg-white/5 transition-all"
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[hsl(40,15%,96%)] font-sans">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar */}
      {sidebarOpen && <Sidebar mobile />}

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-[hsl(40,15%,88%)] px-6 py-4 flex items-center gap-4">
          <button
            className="lg:hidden text-gray-500 hover:text-gray-800 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          </div>
          <div className="ml-auto flex items-center gap-3 text-sm text-gray-500">
            <span className="hidden sm:inline">{user?.email}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  return (
    <ProtectedRoute requireAdmin>
      <AdminLayoutContent title={title}>{children}</AdminLayoutContent>
    </ProtectedRoute>
  );
}
