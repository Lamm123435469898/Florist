import { lazy, Suspense } from 'react';

const Index = lazy(() => import("./pages/index"));
const NotFound = lazy(() => import("./pages/not-found"));
const Products = lazy(() => import("./pages/products"));
const ProductDetail = lazy(() => import("./pages/product-detail"));
const Cart = lazy(() => import("./pages/cart"));
const About = lazy(() => import("./pages/about"));
const Contact = lazy(() => import("./pages/contact"));
const Login = lazy(() => import("./pages/login"));
const Register = lazy(() => import("./pages/register"));
const AdminDashboard = lazy(() => import("./pages/admin/dashboard"));
const AdminProducts = lazy(() => import("./pages/admin/products"));
const AdminOrders = lazy(() => import("./pages/admin/orders"));
const Checkout = lazy(() => import("./pages/checkout"));
const Payment = lazy(() => import("./pages/payment"));
const OrderSuccess = lazy(() => import("./pages/order-success"));
const Orders = lazy(() => import("./pages/orders"));

// A generic loading fallback for Suspense
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
  </div>
);

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<Loading />}>
    <Component />
  </Suspense>
);

export const routers = [
    {
      path: "/",
      name: 'home',
      element: withSuspense(Index),
    },
    {
      path: "/products",
      name: 'products',
      element: withSuspense(Products),
    },
    {
      path: "/products/:id",
      name: 'product-detail',
      element: withSuspense(ProductDetail),
    },
    {
      path: "/cart",
      name: 'cart',
      element: withSuspense(Cart),
    },
    {
      path: "/about",
      name: 'about',
      element: withSuspense(About),
    },
    {
      path: "/contact",
      name: 'contact',
      element: withSuspense(Contact),
    },
    {
      path: "/login",
      name: 'login',
      element: withSuspense(Login),
    },
    {
      path: "/register",
      name: 'register',
      element: withSuspense(Register),
    },
    {
      path: "/admin",
      name: 'admin',
      element: withSuspense(AdminDashboard),
    },
    {
      path: "/admin/products",
      name: 'admin-products',
      element: withSuspense(AdminProducts),
    },
    {
      path: "/admin/orders",
      name: 'admin-orders',
      element: withSuspense(AdminOrders),
    },
    {
      path: "/checkout",
      name: 'checkout',
      element: withSuspense(Checkout),
    },
    {
      path: "/order-success",
      name: 'order-success',
      element: withSuspense(OrderSuccess),
    },
    {
      path: "/orders",
      name: 'orders',
      element: withSuspense(Orders),
    },
    {
      path: "/payment",
      name: 'payment',
      element: withSuspense(Payment),
    },
    /* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */
    {
      path: "*",
      name: '404',
      element: withSuspense(NotFound),
    },
];

declare global {
  interface Window {
    __routers__: typeof routers;
  }
}

window.__routers__ = routers;
