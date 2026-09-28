import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { WhyUs } from '@/components/WhyUs';
import { Services } from '@/components/Services';
import { Resources } from '@/components/Resources';
import { Accompaniment } from '@/components/Accompaniment';
import { Process } from '@/components/Process';
import { Markets } from '@/components/Markets';
import { Testimonials } from '@/components/Testimonials';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <Hero />
      <About />
      <WhyUs />
      <Services />
      <Resources />
      <Accompaniment />
      <Process />
      <Markets />
      <Testimonials />
      <Contact />
      <Footer />
    </main>
  );
}
