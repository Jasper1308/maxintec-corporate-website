import HeroSection from "./HeroSection";
import TestimonialsSection from "./Testimonials";

type TemplateProps = {
  content: {
    title: string;
    subtitle: string;
    description: string;
    image: string;
  }
}

export default function LandingPageTemplate({ content }: TemplateProps) {
    return(
        <main>
            <HeroSection {...content}/>
            <TestimonialsSection />
        </main>
    )
}