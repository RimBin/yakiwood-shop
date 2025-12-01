import Header from '@/components/Header';
import Hero from '@/components/Hero';
import WhyUs from '@/components/WhyUs';
import Products from '@/components/Products';
import Solutions from '@/components/Solutions';
import Projects from '@/components/Projects';
import Steps from '@/components/Steps';
import About from '@/components/About';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--Background-Grey,#E1E1E1)]">
      <Header />
      <div className="flex flex-col gap-[200px]">
        <Hero />
        <WhyUs />
        <Products />
        <Solutions />
        <Projects />
        <Steps />
        <About />
        <FAQ />
        <Footer />
      </div>
    </main>
  );
}
