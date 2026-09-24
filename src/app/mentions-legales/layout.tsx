import { localizedMetadata } from '@/lib/i18n';
import type { ReactNode } from 'react';
export const metadata = localizedMetadata("/mentions-legales", "Mentions légales", "Informations sur l’éditeur du site TalentiQues et son hébergement.");
export default function Layout({ children }: { children: ReactNode }) { return children; }
