import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "@/contexts/CartContext";
import { LangProvider } from "@/contexts/LangContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { Layout } from "@/components/Layout";
import { FloatingCartButton } from "@/components/FloatingCartButton";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Home } from "@/pages/Home";
import { Products } from "@/pages/Products";
import { ProductDetailPage } from "@/pages/ProductDetail";
import { Cart } from "@/pages/Cart";
import { Checkout } from "@/pages/Checkout";
import { Contact } from "@/pages/Contact";
import { NotFound } from "@/pages/NotFound";
import { AdminLogin } from "@/pages/admin/Login";
import { AdminDashboard } from "@/pages/admin/Dashboard";
import { AdminOrders } from "@/pages/admin/Orders";
import { AdminProducts } from "@/pages/admin/Products";
import { AdminCategories } from "@/pages/admin/Categories";

function StorefrontShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Layout>{children}</Layout>
      <FloatingCartButton />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <CartProvider>
          <AdminAuthProvider>
            <Routes>
              {/* Storefront */}
              <Route
                path="/"
                element={
                  <StorefrontShell>
                    <Home />
                  </StorefrontShell>
                }
              />
              <Route
                path="/products"
                element={
                  <StorefrontShell>
                    <Products />
                  </StorefrontShell>
                }
              />
              <Route
                path="/products/:id"
                element={
                  <StorefrontShell>
                    <ProductDetailPage />
                  </StorefrontShell>
                }
              />
              <Route
                path="/cart"
                element={
                  <StorefrontShell>
                    <Cart />
                  </StorefrontShell>
                }
              />
              <Route
                path="/checkout"
                element={
                  <StorefrontShell>
                    <Checkout />
                  </StorefrontShell>
                }
              />
              <Route
                path="/contact"
                element={
                  <StorefrontShell>
                    <Contact />
                  </StorefrontShell>
                }
              />

              {/* Admin */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <AdminGuard>
                    <AdminLayout>
                      <AdminDashboard />
                    </AdminLayout>
                  </AdminGuard>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <AdminGuard>
                    <AdminLayout>
                      <AdminOrders />
                    </AdminLayout>
                  </AdminGuard>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <AdminGuard>
                    <AdminLayout>
                      <AdminProducts />
                    </AdminLayout>
                  </AdminGuard>
                }
              />
              <Route
                path="/admin/categories"
                element={
                  <AdminGuard>
                    <AdminLayout>
                      <AdminCategories />
                    </AdminLayout>
                  </AdminGuard>
                }
              />

              <Route
                path="*"
                element={
                  <StorefrontShell>
                    <NotFound />
                  </StorefrontShell>
                }
              />
            </Routes>

            <Toaster
              position="bottom-center"
              toastOptions={{
                style: {
                  background: "rgb(17 17 24)",
                  color: "rgb(240 240 248)",
                  border: "1px solid rgba(168, 85, 247, 0.4)",
                },
              }}
            />
          </AdminAuthProvider>
        </CartProvider>
      </LangProvider>
    </ThemeProvider>
  );
}
