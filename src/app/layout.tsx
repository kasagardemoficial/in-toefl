import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "In-TOEFL — Do Zero ao TOEFL",
  description: "O app que leva do zero absoluto em inglês até passar no TOEFL. Para universitários brasileiros. 100% gratuito.",
  manifest: "/manifest.json",
  openGraph: {
    title: "In-TOEFL — Do Zero ao TOEFL",
    description: "3.000+ exercícios + 963 questões TOEFL. Teste adaptativo. Método Kumon. Em português. De graça.",
    type: "website",
    siteName: "In-TOEFL",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "In-TOEFL",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#8CB369",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${nunito.variable} antialiased`}
    >
      <body className="min-h-screen bg-white text-[#1A1A1A]" style={{ fontFamily: 'var(--font-nunito), Nunito, sans-serif' }}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
