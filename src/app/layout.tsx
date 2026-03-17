import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Maxintec – Segurança eletrônica e monitoramento 24h",
  description:
    "Câmeras, alarmes, controle de acesso e monitoramento 24h para empresas, condomínios e residências em Santa Catarina com a Maxintec.",
  metadataBase: new URL("https://www.maxintec.seg.br"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Maxintec - Segurança eletrônica e monitoramento 24h",
    description:
      "Soluções completas em segurança eletrônica para empresas, condomínios e residências em SC.",
    url: "https://www.maxintec.seg.br",
    siteName: "Maxintec",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/og-image-maxintec.jpg",
        width: 1200,
        height: 630,
        alt: "Maxintec – segurança eletrônica e monitoramento 24h",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-W3LGFG78');
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-W3LGFG78"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
