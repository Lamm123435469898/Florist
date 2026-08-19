import Index from "./pages/index";
import NotFound from "./pages/not-found";
import Products from "./pages/products";
import ProductDetail from "./pages/product-detail";
import Cart from "./pages/cart";
import About from "./pages/about";
import Contact from "./pages/contact";
import Login from "./pages/login";
import Register from "./pages/register";
import AdminDashboard from "./pages/admin/dashboard";
import AdminProducts from "./pages/admin/products";
import AdminOrders from "./pages/admin/orders";
import Checkout from "./pages/checkout";
import OrderSuccess from "./pages/order-success";
import Orders from "./pages/orders";

export const routers = [
    {
      path: "/",
      name: 'home',
      element: <Index />,
    },
    {
      path: "/products",
      name: 'products',
      element: <Products />,
    },
    {
      path: "/products/:id",
      name: 'product-detail',
      element: <ProductDetail />,
    },
    {
      path: "/cart",
      name: 'cart',
      element: <Cart />,
    },
    {
      path: "/about",
      name: 'about',
      element: <About />,
    },
    {
      path: "/contact",
      name: 'contact',
      element: <Contact />,
    },
    {
      path: "/login",
      name: 'login',
      element: <Login />,
    },
    {
      path: "/register",
      name: 'register',
      element: <Register />,
    },
    {
      path: "/admin",
      name: 'admin',
      element: <AdminDashboard />,
    },
    {
      path: "/admin/products",
      name: 'admin-products',
      element: <AdminProducts />,
    },
    {
      path: "/admin/orders",
      name: 'admin-orders',
      element: <AdminOrders />,
    },
    {
      path: "/checkout",
      name: 'checkout',
      element: <Checkout />,
    },
    {
      path: "/order-success",
      name: 'order-success',
      element: <OrderSuccess />,
    },
    {
      path: "/orders",
      name: 'orders',
      element: <Orders />,
    },
    /* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */
    {
      path: "*",
      name: '404',
      element: <NotFound />,
    },
];

declare global {
  interface Window {
    __routers__: typeof routers;
  }
}

window.__routers__ = routers;
