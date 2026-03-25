import LandingPageTemplate from "../../components/LandingPageTemplate";
import { heroContent } from "../../data/heroContent";
import { notFound } from "next/navigation";
import WhatsAppFloatButton from "@/src/components/ui/WhatsAppFloatButton";

export function generateStaticParams() {
  return [
    { slug: "standard" },
    { slug: "aspiration" },
    { slug: "fire" },
  ];
}

type Variant = 'standard' | 'aspiration' | 'fire';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

const validVariants = ['standard', 'aspiration', 'fire'] as const;

if (!validVariants.includes(slug as any)) {
  notFound();
}

const variant = slug as Variant;

const content = heroContent[variant];
  
  return (
        <main>
          <LandingPageTemplate content={content} variant={variant} />
          <WhatsAppFloatButton />
        </main>
    );
}