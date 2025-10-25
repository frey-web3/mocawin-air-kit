import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

// Definisi font Roboto
const roboto = Roboto({
  weight: ["400", "700"], 
  subsets: ["latin"],
  variable: "--font-roboto", 
});

export const metadata: Metadata = {
  title: "Mocawin - The Smart Way to Bet on Tomorrow",
  description: "Air Kit Demo by Frey",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Menggunakan className dari Roboto dan variabel CSS-nya */}
      <body className={`${roboto.className} ${roboto.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}