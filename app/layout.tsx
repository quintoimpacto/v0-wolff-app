import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WOLFF — Medicina del Deporte",
  description:
    "Centro cardiológico y de medicina deportiva. Formulario de pacientes y panel médico.",
};

export const viewport: Viewport = {
  themeColor: "#a0455d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} h-full antialiased bg-background`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
