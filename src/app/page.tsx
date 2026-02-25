import HeroSection from "../components/herosection";
import LandingPageTemplate from "../components/LandingPageTemplate";
import { landingContent } from "../data/landingContent";

export default function Home() {
  return (
      <LandingPageTemplate {...landingContent.standard} />
  );
}
