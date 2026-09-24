import StorePageTracking from '@/components/store/StorePageTracking';
import StoreTrackingScripts from '@/components/store/StoreTrackingScripts';
import StoreAnalyticsBoundary from '@/components/store/StoreAnalyticsBoundary';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StoreAnalyticsBoundary><StoreTrackingScripts /><StorePageTracking /></StoreAnalyticsBoundary>
      {children}
    </>
  );
}
