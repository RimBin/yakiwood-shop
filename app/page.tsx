import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Products from '@/components/Products';
import Solutions from '@/components/Solutions';
import Projects from '@/components/Projects';
import About from '@/components/About';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Products />
      <Solutions />
      <Projects />
      <About />
      <Contact />
      <Footer />
    </main>
  );
}
