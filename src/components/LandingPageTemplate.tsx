import HeroSection from "./HeroSection";
import TestimonialsSection from "./Testimonials";
import Soluctions from "./Soluctions"

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
            <Soluctions />
            <TestimonialsSection />
        </main>
    )
}