import StoreTrackingScripts from '@/components/store/StoreTrackingScripts';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StoreTrackingScripts />
      {children}
    </>
  );
}
