import type { Metadata } from 'next';
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Preloader } from '@/components/Preloader';
import { headers } from 'next/headers';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import StoreAttribution from '@/components/StoreAttribution';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.talentiques.com'),

  title: {
    default: 'TalentiQues | CV ATS, LinkedIn & carrière francophone',
    template: '%s | TalentiQues',
  },

  description:
    'Diagnostic CV ATS gratuit, optimisation CV, lettre de motivation, LinkedIn, ressources et accompagnement carrière pour les marchés francophones.',

  alternates: {
    canonical: '/',
  },

  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://talentiques.com',
    siteName: 'TalentiQues',

    title:
      'TalentiQues | CV ATS, LinkedIn & carrière francophone',

    description:
      'Diagnostic CV ATS gratuit, services d’optimisation, ressources et accompagnement carrière sur les marchés francophones.',
  },

  icons: {
    icon: '/favicon.svg',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={(await headers()).get('x-talentiques-language') === 'en' ? 'en' : 'fr'} className="scroll-smooth">
      <body
        suppressHydrationWarning
        className={cn(
          jakarta.className,
          outfit.variable,
          'bg-white text-slate-900 min-h-screen antialiased selection:bg-blue-500/30 selection:text-blue-700'
        )}
      >
        <Preloader />

        {children}
        <LanguageSwitcher />
        <StoreAttribution />
      </body>
    </html>
  );
}
