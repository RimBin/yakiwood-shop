import { Hero, WhyUs, Steps, Testimonials, CTA } from '@/components/home';
import Products from '@/components/Products';
import Solutions from '@/components/Solutions';
import Projects from '@/components/Projects';
import FAQ from '@/components/FAQ';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#E1E1E1]">
      <Hero />
      <WhyUs />
      <Products />
      <Solutions />
      <Projects />
      <Steps />
      <Testimonials />
      <FAQ />
      <CTA />
    </main>
  );
}
