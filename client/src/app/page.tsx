import Hero from "@/components/landing-page/hero";
import HowSummerWorks from "@/components/landing-page/how-summer-works";
import WhyPlayersShouldJoin from "@/components/landing-page/why-players-should-join";
import OurMission from "@/components/landing-page/our-mission";
import Inquiry from "@/components/landing-page/inquiry";
import Sponsors from "@/components/landing-page/sponsors";

export default function Home() {
  return (
    <main>
      <Hero />
      <HowSummerWorks />
      <WhyPlayersShouldJoin />
      <OurMission />
      <Inquiry />
      <Sponsors />
    </main>
  );
}
