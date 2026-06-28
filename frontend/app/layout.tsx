import type { Metadata } from "next";
import localFont from "next/font/local";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import "./globals.css";

const manrope = localFont({
  src: "../public/fonts/Manrope-VariableFont_wght.ttf",
  variable: "--font-manrope",
  weight: "200 800",
  style: "normal",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "KosHandayani",
  description: "Aplikasi manajemen kos, pengajuan sewa, dan pembayaran online.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <AuthProvider>{children}</AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
