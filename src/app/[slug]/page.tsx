import LandingPageTemplate from "../../components/LandingPageTemplate";
import { heroContent } from "../../data/heroContent";
import { notFound } from "next/navigation";
import WhatsAppFloatButton from "@/components/ui/WhatsAppFloatButton";

export function generateStaticParams() {
  return [
    { slug: "standard" },
    { slug: "aspiration" },
    { slug: "fire" },
  ] as const;
}

type Variant = "standard" | "aspiration" | "fire";

type PageProps = {
  params: {
    slug: Variant;
  };
};

export default function Page({ params }: PageProps) {
  const { slug } = params;
  const validVariants = ["standard", "aspiration", "fire"] as const;

  if (!validVariants.includes(slug)) {
    notFound();
  }

  const content = heroContent[slug];

  return (
    <main>
      <LandingPageTemplate content={content} variant={slug} />
      <WhatsAppFloatButton />
    </main>
  );
}
