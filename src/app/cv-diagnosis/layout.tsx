import { localizedMetadata } from '@/lib/i18n';
import type { ReactNode } from 'react';
export const metadata = localizedMetadata("/cv-diagnosis", "Diagnostic CV ATS", "Analysez votre CV et identifiez des pistes pour améliorer votre candidature.");
export default function Layout({ children }: { children: ReactNode }) { return children; }
