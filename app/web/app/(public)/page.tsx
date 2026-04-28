import Hero from '@/components/Hero';
import WhyChooseUs from '@/components/WhyChooseUs';
import ExpertSolutionsSection from '@/components/ExpertSolutionsSection';
import CounterSection from '@/components/CounterSection';
import AgentCTASection from '@/components/AgentCTASection';
import ServicesSection from '@/components/ServicesSection';
import VideoTourSection from '@/components/VideoTourSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import LatestProperties from '@/components/LatestProperties';
import LoanFacilitySection from '@/components/LoanFacilitySection';

export default function Home() {
  return (
    <main className="flex-1 flex flex-col">
      <Hero />
      
      <LatestProperties />

      <LoanFacilitySection />

      <WhyChooseUs />

      <ServicesSection />
      
      <ExpertSolutionsSection />

      <VideoTourSection />

      <CounterSection />

      <TestimonialsSection />


      <AgentCTASection />
    </main>
  );
}
