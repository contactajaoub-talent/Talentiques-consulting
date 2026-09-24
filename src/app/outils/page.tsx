import { localizedMetadata } from '@/lib/i18n';
import StorePageFR from '@/components/store/StorePageFR';

export const metadata = localizedMetadata('/outils', "Outils carrière : Tracker, CV ATS & Bundle", "Opportunity Tracker Pro, CV ATS System et Career Search Bundle : des outils réutilisables pour structurer votre recherche, renforcer vos candidatures et suivre vos opportunités.");

export default function OutilsPage() {
  return <StorePageFR />;
}
