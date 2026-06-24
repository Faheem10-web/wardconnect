import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NextAuthProvider from "@/components/SessionProvider";
import BottomNav from "@/components/BottomNav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "WardConnect - Premium Citizen Service Platform",
  description: "Citizen complaint tracking and neighborhood management platform.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WardConnect",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <head>
        <meta name="theme-color" content="#14B8A6" />
        <link rel="apple-touch-icon" href="/next.svg" />
      </head>
      <body className="font-sans antialiased bg-bg-alt text-text-body min-h-screen flex flex-col pb-16 md:pb-0">
        <NextAuthProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <BottomNav />
          <Footer />
        </NextAuthProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(reg) { console.log('SW registered:', reg.scope); },
                    function(err) { console.log('SW registration failed:', err); }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
