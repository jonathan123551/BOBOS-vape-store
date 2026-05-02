import type { Metadata, Viewport } from "next";
import { Inter, Tajawal } from "next/font/google";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "./globals.css";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const arabic = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BOBOS Vapes Store",
  description: "Premium vapes, pods and e-liquids — delivered fast.",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0b0b14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning className={`${sans.variable} ${arabic.variable}`}>
      <head>
        <script
          // Prevent FOUC for theme + lang on first paint.
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var l=localStorage.getItem('lang');if(t!=='light'&&t!=='dark')t='dark';if(l!=='en'&&l!=='ar')l='en';if(t==='dark')document.documentElement.classList.add('dark');document.documentElement.lang=l;document.documentElement.dir=l==='ar'?'rtl':'ltr';}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
