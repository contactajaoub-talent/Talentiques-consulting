import type { Metadata } from 'next';
import { AcquisitionProvider } from '@/components/acquisition/AcquisitionProvider';
import { AcquisitionShell } from '@/components/acquisition/AcquisitionShell';
import { requireAdminSession } from '@/lib/affiliate/admin-auth';
import { getAcquisitionState } from '@/lib/acquisition/queries';

export const metadata: Metadata = { title: 'Acquisition OS', robots: { index: false, follow: false, nocache: true } };
export const dynamic = 'force-dynamic';

export default async function AcquisitionLayout({ children }: { children: React.ReactNode }) {
  await requireAdminSession();
  const initialState = await getAcquisitionState();
  return <AcquisitionProvider initialState={initialState}><AcquisitionShell><div className="mx-auto max-w-[1680px] px-4 py-8 sm:px-7 lg:px-10 lg:py-10">{children}</div></AcquisitionShell></AcquisitionProvider>;
}
