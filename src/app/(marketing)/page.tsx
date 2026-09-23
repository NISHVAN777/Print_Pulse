import { Hero } from "@/components/landing/hero";
import {
  DigitalTwinSection,
  Features,
  FinalCta,
  HowItWorks,
  Impact,
  Problem,
  RoadmapTeaser,
  WhoBenefits,
} from "@/components/landing/sections";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Problem />
      <HowItWorks />
      <DigitalTwinSection />
      <Features />
      <WhoBenefits />
      <Impact />
      <RoadmapTeaser />
      <FinalCta />
    </>
  );
}
