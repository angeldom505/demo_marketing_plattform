import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HU Marketing Suite",
  description: "Plataforma de marketing inmobiliario con IA — Hogares Unión",
  icons: { icon: "/logo-hu.png", apple: "/logo-hu.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=Geist+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
