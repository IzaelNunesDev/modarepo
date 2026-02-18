import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProviderWrapper } from "@/components/CartProviderWrapper";
import { BottomNav } from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Moda Store - Loja de Roupas",
  description: "A melhor loja de roupas femininas. Encontre vestidos, blusas, calças e muito mais.",
  keywords: ["moda", "roupas", "vestidos", "feminino", "loja online"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#fcf8fa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800&family=Noto+Sans:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <CartProviderWrapper>
          {children}
          <BottomNav />
        </CartProviderWrapper>
      </body>
    </html>
  );
}
