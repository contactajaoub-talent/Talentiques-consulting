/* eslint-disable @next/next/no-img-element -- Reuse the original local flag SVGs at their source dimensions. */
import { testimonials } from '@/app/career-search-360/content';
import type { HomeLocale } from '@/lib/home-content';
import styles from './Testimonials.module.css';

export const Testimonials = ({ locale = 'fr' }: { locale?: HomeLocale }) => {
  const fr = locale === 'fr';
  return (
    <section id="testimonials" className={styles.section} aria-labelledby="testimonial-title">
      <div className={styles.inner}>
        <div>
          <p className={styles.kicker}>{fr ? 'DES PARCOURS, DES PERSONNES' : 'JOURNEYS AND PEOPLE'}</p>
          <h2 id="testimonial-title">{fr ? 'Leurs mots.' : 'Their words.'}<span>{fr ? ' Leur expérience.' : ' Their experience.'}</span></h2>
        </div>
        <div className={styles.viewport} tabIndex={0} aria-label={fr ? 'Témoignages TALENTIQUES · défilement suspendu au survol ou au focus' : 'TALENTIQUES testimonials · scrolling pauses on hover or focus'}>
          <div className={`${styles.track} animate-marquee`}>
            {[0, 1].map(copy => (
              <div key={copy} className={styles.group} aria-hidden={copy === 1 ? true : undefined}>
                {testimonials.map(item => (
                  <figure key={item.name} className={styles.card}>
                    <figcaption>
                      <strong>{item.name}</strong>
                      <span><img src={`/career-search-360/flags/${item.countryCode.toLowerCase()}.svg`} alt="" width="22" height="16" loading="lazy" />{item.country[locale]}</span>
                    </figcaption>
                    <blockquote lang="fr">{item.quote}</blockquote>
                  </figure>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
