import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Şantiye Günlüğü",
  description: "Saha fotoğraf ve ilerleme kaydı",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Şantiye Günlüğü",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-neutral-50">{children}</body>
    </html>
  );
}
