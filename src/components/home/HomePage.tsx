'use client';

import { MotionConfig } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { WhyUs } from '@/components/WhyUs';
import { Credibility } from '@/components/Credibility';
import { AlternanceFeature } from '@/components/AlternanceFeature';
import { Services } from '@/components/Services';
import { Process } from '@/components/Process';
import { Testimonials } from '@/components/Testimonials';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';
import type { HomeLocale } from '@/lib/home-content';

export function HomePage({ locale }: { locale: HomeLocale }) {
  return <MotionConfig reducedMotion="user">
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      <Navbar locale={locale}/>
      <main>
        <Hero locale={locale}/>
        <WhyUs locale={locale}/>
        <Credibility locale={locale}/>
        <AlternanceFeature locale={locale}/>
        <Services locale={locale}/>
        <Process locale={locale}/>
        <Testimonials/>
        <Contact locale={locale}/>
      </main>
      <Footer locale={locale}/>
    </div>
  </MotionConfig>;
}
