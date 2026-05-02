"use client";

import { Toaster } from "react-hot-toast";
import { CartProvider } from "./CartContext";
import { ThemeProvider } from "./ThemeContext";
import { LangProvider } from "./LangContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LangProvider>
        <CartProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "rgb(17 17 24)",
                color: "#f5f3ff",
                border: "1px solid rgba(168,85,247,0.35)",
                boxShadow: "0 0 24px rgba(168,85,247,0.25)",
              },
            }}
          />
        </CartProvider>
      </LangProvider>
    </ThemeProvider>
  );
}
