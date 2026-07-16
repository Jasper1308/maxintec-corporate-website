import LandingPageTemplate from "@/components/landing/LandingPageTemplate";
import { heroContent } from "@/data/landing/heroContent";
import WhatsAppFloatButton from "@/components/ui/WhatsAppFloatButton";

export default function LandingPage() {
  return (
    <main>
      <LandingPageTemplate content={heroContent.standard} variant="standard" />
      <WhatsAppFloatButton />
    </main>
  );
}
