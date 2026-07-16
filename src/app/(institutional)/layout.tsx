import type { Metadata } from "next";
import Header from "@/components/institutional/Header";
import Footer from "@/components/institutional/Footer";

export const metadata: Metadata = {
  title: "Maxintec Institucional",
  description: "Página institucional da Maxintec.",
};

export default function InstitutionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
