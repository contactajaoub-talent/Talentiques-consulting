import StorePageTracking from '@/components/store/StorePageTracking';
import StoreTrackingScripts from '@/components/store/StoreTrackingScripts';

export default function EnglishStoreLayout({ children }: { children: React.ReactNode }) {
  return <><StoreTrackingScripts /><StorePageTracking />{children}</>;
}
