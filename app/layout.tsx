import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Retro Tamagochi – Digitális kedvenc gondozó",
  description:
    "Nevezd el a digitális kedvencedet, figyeld a hangulatát, és élvezd a retró minijátékokat a böngésződből.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
