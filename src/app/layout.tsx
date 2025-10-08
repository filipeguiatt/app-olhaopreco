import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OlhaOPreço - Comparador de Preços Portugal",
  description: "Compara preços das melhores lojas portuguesas. Encontra as melhores ofertas em tecnologia, eletrodomésticos e muito mais.",
  keywords: ["preços", "comparação", "portugal", "lojas", "tecnologia", "ofertas", "promoções"],
  authors: [{ name: "OlhaOPreço Team" }],
  creator: "OlhaOPreço",
  publisher: "OlhaOPreço",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://olhaopreco.vercel.app'),
  openGraph: {
    title: "OlhaOPreço - Comparador de Preços Portugal",
    description: "Compara preços das melhores lojas portuguesas. Encontra as melhores ofertas em tecnologia.",
    url: 'https://olhaopreco.vercel.app',
    siteName: 'OlhaOPreço',
    locale: 'pt_PT',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "OlhaOPreço - Comparador de Preços Portugal",
    description: "Compara preços das melhores lojas portuguesas. Encontra as melhores ofertas em tecnologia.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-PT">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}