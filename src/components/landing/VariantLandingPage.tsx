import LandingPageTemplate from '@/components/landing/LandingPageTemplate';
import WhatsAppFloatButton from '@/components/ui/WhatsAppFloatButton';
import { heroContent } from '@/data/landing/heroContent';

export type LandingVariant =
  | 'standard'
  | 'aspiration'
  | 'fire';

export default function VariantLandingPage({
  variant,
}: {
  variant: LandingVariant;
}) {
  return (
    <main>
      <LandingPageTemplate
        content={heroContent[variant]}
        variant={variant}
      />

      <WhatsAppFloatButton />
    </main>
  );
}