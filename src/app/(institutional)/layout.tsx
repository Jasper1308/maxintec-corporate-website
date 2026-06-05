import type { Metadata } from "next";
import Header from "@/components/ui/Header";

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
    </>
  );
}
