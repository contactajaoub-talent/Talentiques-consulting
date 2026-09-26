import { Suspense } from 'react';
import StoreAffiliateAttribution from '@/components/store/StoreAffiliateAttribution';
import StorePageTracking from '@/components/store/StorePageTracking';
import StoreTrackingScripts from '@/components/store/StoreTrackingScripts';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StoreTrackingScripts />
      <StorePageTracking />
      <Suspense fallback={null}>
        <StoreAffiliateAttribution />
      </Suspense>
      {children}
    </>
  );
}
