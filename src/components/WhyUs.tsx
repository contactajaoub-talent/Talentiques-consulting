'use client';

import { motion } from 'framer-motion';
import { getHomeContent, type HomeLocale } from '@/lib/home-content';

export function WhyUs({ locale = 'fr' }: { locale?: HomeLocale }) {
  const copy = getHomeContent(locale).approach;

  return (
    <section id="why-us" className="overflow-hidden bg-white py-24 lg:py-32">
      <div className="container mx-auto px-5 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          <motion.header
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-xl"
          >
            <span className="text-xs font-bold uppercase tracking-[.22em] text-[#0683C9]">
              {copy.eyebrow}
            </span>
            <h2 className="mt-5 font-heading text-4xl font-bold leading-[1.12] tracking-[-.03em] text-slate-950 md:text-5xl">
              {copy.title}
            </h2>
            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
              {copy.description}
            </p>
          </motion.header>

          <div className="border-t border-slate-200">
            {copy.items.map(([title, description], index) => (
              <motion.article
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.07 }}
                className="group grid gap-4 border-b border-slate-200 py-8 sm:grid-cols-[4rem_1fr] sm:gap-6 lg:py-10"
              >
                <span className="pt-1 font-heading text-sm font-bold tracking-[.16em] text-[#0683C9]">
                  0{index + 1}
                </span>
                <div className="transition-transform duration-300 group-hover:translate-x-1">
                  <h3 className="font-heading text-2xl font-bold tracking-[-.02em] text-slate-950">
                    {title}
                  </h3>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                    {description}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
