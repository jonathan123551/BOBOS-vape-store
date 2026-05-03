import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "@/contexts/CartContext";
import { LangProvider } from "@/contexts/LangContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Layout } from "@/components/Layout";
import { FloatingCartButton } from "@/components/FloatingCartButton";
import { Home } from "@/pages/Home";
import { Products } from "@/pages/Products";
import { ProductDetailPage } from "@/pages/ProductDetail";
import { Cart } from "@/pages/Cart";
import { Checkout } from "@/pages/Checkout";
import { Contact } from "@/pages/Contact";
import { NotFound } from "@/pages/NotFound";

export default function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <CartProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
          <FloatingCartButton />
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
        </CartProvider>
      </LangProvider>
    </ThemeProvider>
  );
}
