import LandingPageTemplate from "@/components/LandingPageTemplate";
import { heroContent } from "@/data/heroContent";
import WhatsAppFloatButton from "@/components/ui/WhatsAppFloatButton";

export default function LandingPage() {
  return (
    <main>
      <LandingPageTemplate content={heroContent.standard} variant="standard" />
      <WhatsAppFloatButton />
    </main>
  );
}
