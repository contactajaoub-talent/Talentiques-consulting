import type { Metadata } from 'next';
import { StoreAccessContent } from '@/app/outils/acces/page';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Your access | TalentiQues', robots: { index: false, follow: false } };
export default function Page({ searchParams }: { searchParams: Promise<{ token?: string }> }) { return <StoreAccessContent searchParams={searchParams} market="en" />; }
