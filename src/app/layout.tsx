import type { Metadata, Viewport } from "next";
import { Manrope, Noto_Sans } from "next/font/google";
import "./globals.css";
import { CartProviderWrapper } from "@/components/CartProviderWrapper";
import { BottomNav } from "@/components/BottomNav";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-noto-sans",
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "Moda Store - Loja de Roupas",
  description: "A melhor loja de roupas femininas. Encontre vestidos, blusas, calças e muito mais.",
  keywords: ["moda", "roupas", "vestidos", "feminino", "loja online"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fcf8fa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${manrope.variable} ${notoSans.variable}`}>
      <body className="antialiased">
        <CartProviderWrapper>
          {children}
          <BottomNav />
        </CartProviderWrapper>
      </body>
    </html>
  );
}
