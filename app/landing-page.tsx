import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import StatsSection from "./components/StatsSection";
import ShowcaseSection from "./components/ShowcaseSection";
import FeaturesSection from "./components/FeaturesSection";
import HowItWorksSection from "./components/HowItWorksSection";
import BenefitsSection from "./components/BenefitsSection";
import ToolsSection from "./components/ToolsSection";
import FAQSection from "./components/FAQSection";
import CTASection from "./components/CTASection";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="h-full w-full">
      <Navbar />
      <main className="z-0 bg-almostblack dark:bg-black relative flex flex-col items-center overflow-x-hidden">
        <section className="max-w-screen-2xl w-full relative py-24 px-4 md:px-16">
          <HeroSection />
          {/* <StatsSection /> */}
          {/* <ShowcaseSection /> */}
          <FeaturesSection />
          <HowItWorksSection />
          {/* <BenefitsSection /> */}
          <ToolsSection />
          {/* <FAQSection /> */}
          <CTASection />
        </section>
        <Footer />
      </main>
    </div>
  );
}
