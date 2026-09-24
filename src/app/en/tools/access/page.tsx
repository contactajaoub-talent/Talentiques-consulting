import type { Metadata } from 'next';
import StoreAccessPage from '@/components/store/StoreAccessPage';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Your resources', robots: { index: false, follow: false }, referrer: 'no-referrer' };
export default function Page(props: { searchParams: Promise<{ token?: string }> }) {
  return <StoreAccessPage {...props} market="en" />;
}
