import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maxintec – Segurança e Automação",
  description:
    "Câmeras, alarmes, controle de acesso e monitoramento 24h para empresas, condomínios e residências em Santa Catarina com a Maxintec.",
  metadataBase: new URL("https://www.maxintec.seg.br"),
  alternates: {
    canonical: "/landing",
  },
  openGraph: {
    title: "Maxintec - Segurança eletrônica e monitoramento 24h",
    description:
      "Soluções completas em segurança eletrônica para empresas, condomínios e residências em SC.",
    url: "https://www.maxintec.seg.br/landing",
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

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
