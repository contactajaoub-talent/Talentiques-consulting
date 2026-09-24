import { localizedMetadata } from '@/lib/i18n';
import type { ReactNode } from 'react';
export const metadata = localizedMetadata("/conditions-generales", "Conditions générales", "Conditions d’utilisation des services et ressources TalentiQues.");
export default function Layout({ children }: { children: ReactNode }) { return children; }
