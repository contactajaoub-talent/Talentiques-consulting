import type { Metadata } from 'next';
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { RouteAwarePreloader } from '@/components/RouteAwarePreloader';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://talentiques.com'),

  title: {
    default: 'TalentiQues | L’écosystème des opportunités professionnelles',
    template: '%s | TalentiQues',
  },

  description:
    'Talentiques aide étudiants, candidats et professionnels à accéder à de meilleures opportunités grâce à des outils, ressources, systèmes et solutions pour l’emploi, les stages, l’alternance, la mobilité et l’évolution de carrière.',

  alternates: {
    canonical: '/',
  },

  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://talentiques.com',
    siteName: 'TalentiQues',

    title:
      'TalentiQues | L’écosystème des opportunités professionnelles',

    description:
      'Talentiques aide étudiants, candidats et professionnels à accéder à de meilleures opportunités grâce à des outils, ressources, systèmes et solutions pour l’emploi, les stages, l’alternance, la mobilité et l’évolution de carrière.',
  },

  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body
        suppressHydrationWarning
        className={cn(
          jakarta.className,
          outfit.variable,
          'bg-white text-slate-900 min-h-screen antialiased selection:bg-blue-500/30 selection:text-blue-700'
        )}
      >
        <RouteAwarePreloader />

        {children}
      </body>
    </html>
  );
}
