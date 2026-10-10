import type { Metadata } from "next";
import { Dela_Gothic_One, Inter } from "next/font/google";
import "./globals.css";

const delaGothic = Dela_Gothic_One({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "bored·works — Un estudio de mundos, personajes e historias",
  description:
    "bored·works es un estudio de producción y gestión de IPs. Creamos personajes e historias para hacer contenido.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${delaGothic.variable} ${inter.variable}`}>
        {children}
      </body>
    </html>
  );
}
