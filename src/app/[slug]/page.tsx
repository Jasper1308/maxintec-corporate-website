import LandingPageTemplate from "../../components/LandingPageTemplate";
import { heroContent } from "../../data/heroContent";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const content = heroContent[slug as keyof typeof heroContent];

  if (!content) {
    notFound();
  }

  return <LandingPageTemplate content={content} />;
}