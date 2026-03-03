import LandingPageTemplate from "../components/LandingPageTemplate";
import { heroContent } from "../data/heroContent";

export default function Home() {
  return (
      <LandingPageTemplate content={heroContent.standard}/>
  );
}
