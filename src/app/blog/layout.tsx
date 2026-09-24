import { localizedMetadata } from '@/lib/i18n';
import type { ReactNode } from 'react';
export const metadata = localizedMetadata("/blog", "Conseils carrière", "Conseils pratiques pour votre CV, votre profil LinkedIn et votre recherche d’emploi.");
export default function Layout({ children }: { children: ReactNode }) { return children; }
