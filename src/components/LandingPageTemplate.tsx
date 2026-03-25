import HeroSection from "./HeroSection";
import TestimonialsSection from "./Testimonials";
import Soluctions from "./Soluctions"

type TemplateProps = {
  content: {
    title: string;
    subtitle: string;
    description: string;
    image: string;
  };
  variant: 'standard' | 'aspiration' | 'fire';
};

export default function LandingPageTemplate({ content, variant }: TemplateProps) {
  return (
    <main>
      <HeroSection {...content} />
      <Soluctions variant={variant} />
      <TestimonialsSection />
    </main>
  );
}