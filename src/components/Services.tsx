'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { getHomeContent, type HomeLocale } from '@/lib/home-content';

export function Services({ locale = 'fr' }: { locale?: HomeLocale }) {
  const copy = getHomeContent(locale).services;
  const contactHref = locale === 'fr' ? '/#contact' : '/en#contact';
  const featured = copy.cards[2];
  const secondary = copy.cards.slice(0, 2);

  return (
    <section id="services" className="relative overflow-hidden bg-white py-24 lg:py-32">
      <div
        className="pointer-events-none absolute -left-28 top-20 h-72 w-72 rounded-full bg-sky-100/45 blur-[110px]"
        aria-hidden="true"
      />

      <div className="container relative mx-auto px-5 md:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.header
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid gap-7 border-b border-slate-200 pb-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-16 lg:pb-12"
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-[.22em] text-[#0683C9]">
                {copy.eyebrow}
              </span>
              <h2 className="mt-5 max-w-2xl font-heading text-4xl font-bold leading-[1.12] tracking-[-.03em] text-slate-950 md:text-5xl">
                {copy.title}
              </h2>
            </div>

            <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg lg:justify-self-end">
              {copy.description}
            </p>
          </motion.header>

          <motion.article
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative mt-12 overflow-hidden border-y border-sky-200 bg-sky-50/55 px-0 py-10 sm:px-8 lg:px-10 lg:py-12"
          >
            <div
              className="pointer-events-none absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/70 to-transparent"
              aria-hidden="true"
            />

            <div className="relative grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-16">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[.16em] text-[#0683C9]">
                  {featured.audience}
                </span>
                <h3 className="mt-4 max-w-3xl font-heading text-3xl font-bold leading-tight tracking-[-.03em] text-slate-950 sm:text-4xl">
                  {featured.title}
                </h3>
                <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
                  {featured.description}
                </p>

                <Link
                  href={contactHref}
                  className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#0683C9] transition hover:text-[#056da8]"
                >
                  {featured.cta}
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div className="border-t border-sky-200/80 lg:border-l lg:border-t-0 lg:pl-10">
                {featured.points.map((point, index) => (
                  <div
                    key={point}
                    className="grid grid-cols-[2.8rem_1fr] gap-4 border-b border-sky-200/80 py-5 last:border-b-0"
                  >
                    <span className="font-heading text-xs font-bold tracking-[.16em] text-[#0683C9]">
                      0{index + 1}
                    </span>
                    <p className="font-medium leading-6 text-slate-800">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.article>

          <div className="mt-12 grid border-y border-slate-200 md:grid-cols-2">
            {secondary.map((service, index) => (
              <motion.article
                key={service.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className={`py-9 md:px-8 lg:py-11 lg:px-10 ${
                  index === 1 ? 'border-t border-slate-200 md:border-l md:border-t-0' : ''
                }`}
              >
                <span className="text-[11px] font-bold uppercase tracking-[.14em] text-slate-500">
                  {service.audience}
                </span>
                <h3 className="mt-4 max-w-xl font-heading text-2xl font-bold leading-tight tracking-[-.02em] text-slate-950">
                  {service.title}
                </h3>
                <p className="mt-4 max-w-xl leading-7 text-slate-600">
                  {service.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
                  {service.points.map((point) => (
                    <span key={point} className="inline-flex items-center gap-2 text-sm text-slate-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#0683C9]" aria-hidden="true" />
                      {point}
                    </span>
                  ))}
                </div>

                <Link
                  href={contactHref}
                  className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#0683C9] transition hover:text-[#056da8]"
                >
                  {service.cta}
                  <ArrowRight size={16} />
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
