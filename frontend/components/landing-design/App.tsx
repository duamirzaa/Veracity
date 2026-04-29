import { Navbar } from "./components/Navbar";
import { HeroFigma } from "./components/HeroFigma";
import { FeaturesSection } from "./components/FeaturesSection";
import { ProblemSection } from "./components/ProblemSection";
import { SolutionSection } from "./components/SolutionSection";
import { HowItWorksFigma } from "./components/HowItWorksFigma";
import { IntegrationSection } from "./components/IntegrationSection";
import { PricingSection } from "./components/PricingSection";
import { CTASection } from "./components/CTASection";
import { FooterSection } from "./components/FooterSection";

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden font-sans">
      <Navbar />
      <HeroFigma />
      <FeaturesSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksFigma />
      <IntegrationSection />
      <PricingSection />
      <CTASection />
      <FooterSection />
    </div>
  );
}
