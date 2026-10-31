/* eslint-disable @next/next/no-img-element -- Keep the original local company SVGs and optical logo sizes. */
import type { HomeLocale } from '@/lib/home-content';
import styles from './EmployerLogoMarquee.module.css';

// Reused from the Career Search 360 landing, including its approved company list.
// Asset provenance: public/career-search-360/companies/sources.json.
const companies = [
  { name: 'Capgemini', file: 'capgemini.svg', height: 28 },
  { name: 'Emirates', file: 'emirates.svg', height: 56 },
  { name: 'Schneider Electric', file: 'schneider-electric.svg', height: 34 },
  { name: 'Orica Limited', file: 'orica.svg', height: 34 },
  { name: 'Desjardins', file: 'desjardins.svg', height: 28 },
  { name: 'CIBC', file: 'cibc.svg', height: 31 },
  { name: 'FedEx', file: 'fedex.svg', height: 32 },
  { name: 'Deloitte', file: 'deloitte.svg', height: 27, darkBackground: true },
  { name: 'AGCO Corporation', file: 'agco.png', height: 46 },
  { name: 'Acolad Group', file: 'acolad.svg', height: 32 },
  { name: 'Société Générale', file: 'societe-generale.svg', height: 29 },
];

export function EmployerLogoMarquee({ locale = 'fr' }: { locale?: HomeLocale }) {
  const fr = locale === 'fr';
  return (
    <section className={styles.section} aria-label={fr ? 'Entreprises où les talents accompagnés ont décroché des opportunités' : 'Companies where supported talent secured opportunities'}>
      <p>{fr
        ? 'Des talents accompagnés par TALENTIQUES ont décroché des opportunités dans des entreprises comme…'
        : 'Talent supported by TALENTIQUES has secured opportunities at companies such as…'}</p>
      <div className={styles.viewport} tabIndex={0} aria-label={fr ? 'Les 11 entreprises · défilement suspendu au survol ou au focus' : 'The 11 companies · scrolling pauses on hover or focus'}>
        <div className={styles.track}>
          {[0, 1].map(copy => (
            <div key={copy} className={styles.group} aria-hidden={copy === 1 ? true : undefined}>
              {companies.map(company => (
                <span key={company.name} className={styles.logo} data-dark-logo={company.darkBackground || undefined}>
                  <img src={`/career-search-360/companies/${company.file}`} alt={copy === 0 ? company.name : ''} width="160" height="56" loading="eager" decoding="async" style={{ height: company.height }} />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <small>
        {fr ? (
          <>
            <span className="block">
              Les entreprises présentées correspondent à des opportunités obtenues par des talents accompagnés par TALENTIQUES.
            </span>
            <span className="mt-1 block">
              Leur présence n’implique aucun partenariat commercial, affiliation ou soutien de leur part.
            </span>
          </>
        ) : (
          <>
            <span className="block">
              The companies featured reflect opportunities secured by talent supported by TALENTIQUES.
            </span>
            <span className="mt-1 block">
              Their inclusion does not imply any commercial partnership, affiliation or endorsement.
            </span>
          </>
        )}
      </small>
    </section>
  );
}
