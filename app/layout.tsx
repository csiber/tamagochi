import type { Metadata } from "next";
import "./globals.css";

import { inter, pressStart } from "./fonts";

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
      <body className={`${inter.className} ${pressStart.variable}`}>{children}</body>
    </html>
  );
}
