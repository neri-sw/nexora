import type { Metadata, Viewport } from "next";
import { Gelasio, Hanken_Grotesk, Pacifico } from "next/font/google";
import "./globals.css";

const gelasio = Gelasio({
  variable: "--font-gelasio",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
});

/** Script del logo: solo para la palabra de acento en titulares grandes. */
const pacifico = Pacifico({
  variable: "--font-pacifico",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://puerto-chill.vercel.app"),
  title: { default: "Puerto Chill · Bazar y marroquinería", template: "%s · Puerto Chill" },
  description:
    "Bazar, bolsos y accesorios elegidos para vos. Comprá online, retirá en Isidro Casanova o recibilo en todo el país.",
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "Puerto Chill",
    title: "Puerto Chill · Bazar y marroquinería",
    description: "Bazar, bolsos y accesorios elegidos para vos. Comprá online, retirá en Isidro Casanova o recibilo en todo el país.",
    url: "/",
  },
};

export const viewport: Viewport = {
  themeColor: "#3a4128",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-AR" className={`${gelasio.variable} ${hanken.variable} ${pacifico.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
