import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "POS CAOCAO - Premium Multi-Tenant Cafe System",
  description: "Enterprise Point of Sale tailored for artisan food, beverages, and specialty cafes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="font-sans antialiased bg-cafe-50 text-cafe-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
